import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { Repository } from 'typeorm';
import {
  AiProviderTestStatus,
  AiProviderType,
} from '../../common/enums/app.enums';
import { TestAiProviderConfigDto } from './dto/test-ai-provider-config.dto';
import { UpdateAiProviderConfigDto } from './dto/update-ai-provider-config.dto';
import { AiProviderConfigEntity } from './entities/ai-provider-config.entity';

interface ResolvedAiConfig {
  baseUrl: string;
  apiKey: string;
  modelName?: string | null;
}

@Injectable()
export class AiSettingsService {
  constructor(
    @InjectRepository(AiProviderConfigEntity)
    private readonly configRepository: Repository<AiProviderConfigEntity>,
  ) {}

  async getConfig(userId: string) {
    const config = await this.configRepository.findOne({ where: { userId } });
    return this.toResponse(config);
  }

  async hasUsableConfig(userId: string) {
    const config = await this.configRepository.findOne({ where: { userId } });
    return Boolean(config?.isEnabled && config.apiKeyEncrypted && config.baseUrl);
  }

  async getRuntimeConfig(userId: string) {
    const config = await this.configRepository.findOne({ where: { userId } });

    if (!config?.isEnabled || !config.apiKeyEncrypted || !config.baseUrl) {
      throw new BadRequestException('请先配置并启用 AI API Key');
    }

    return {
      providerType: config.providerType,
      providerName: config.providerName,
      baseUrl: config.baseUrl,
      apiKey: this.decryptApiKey(config.apiKeyEncrypted),
      modelName: config.modelName,
    };
  }

  async upsertConfig(userId: string, dto: UpdateAiProviderConfigDto) {
    let config = await this.configRepository.findOne({ where: { userId } });

    if (!config && (!dto.apiKey || !dto.baseUrl)) {
      throw new BadRequestException('首次配置必须提供 API Key 和接口地址');
    }

    if (!config) {
      config = this.configRepository.create({
        userId,
        providerType: AiProviderType.OPENAI_COMPATIBLE,
        providerName: 'OpenAI Compatible',
        baseUrl: dto.baseUrl!,
        apiKeyEncrypted: this.encryptApiKey(dto.apiKey!),
        apiKeyMask: this.maskApiKey(dto.apiKey!),
        lastTestStatus: AiProviderTestStatus.UNTESTED,
      });
    }

    if (dto.providerType !== undefined) {
      config.providerType = dto.providerType;
    }
    if (dto.providerName !== undefined) {
      config.providerName = dto.providerName;
    }
    if (dto.baseUrl !== undefined) {
      config.baseUrl = this.normalizeBaseUrl(dto.baseUrl);
    }
    if (dto.apiKey !== undefined) {
      config.apiKeyEncrypted = this.encryptApiKey(dto.apiKey);
      config.apiKeyMask = this.maskApiKey(dto.apiKey);
    }
    if (dto.modelName !== undefined) {
      config.modelName = dto.modelName;
    }
    if (dto.isEnabled !== undefined) {
      config.isEnabled = dto.isEnabled;
    }

    if (dto.testConnection) {
      const result = await this.testResolvedConfig({
        baseUrl: config.baseUrl,
        apiKey: this.decryptApiKey(config.apiKeyEncrypted),
        modelName: config.modelName,
      });
      this.applyTestResult(config, result);
    } else if (dto.apiKey !== undefined || dto.baseUrl !== undefined) {
      config.lastTestStatus = AiProviderTestStatus.UNTESTED;
      config.lastTestMessage = '配置已更新，等待重新测试';
      config.lastTestAt = null;
    }

    const saved = await this.configRepository.save(config);
    return this.toResponse(saved);
  }

  async testConfig(userId: string, dto: TestAiProviderConfigDto) {
    const config = await this.configRepository.findOne({ where: { userId } });
    const resolved = this.resolveConfig(config, dto);
    const result = await this.testResolvedConfig(resolved);

    if (config && !dto.apiKey && !dto.baseUrl) {
      this.applyTestResult(config, result);
      await this.configRepository.save(config);
    }

    return result;
  }

  private resolveConfig(
    config: AiProviderConfigEntity | null,
    dto: TestAiProviderConfigDto,
  ): ResolvedAiConfig {
    const baseUrl = dto.baseUrl ?? config?.baseUrl;
    const apiKey = dto.apiKey ?? (config ? this.decryptApiKey(config.apiKeyEncrypted) : undefined);

    if (!baseUrl || !apiKey) {
      throw new BadRequestException('请先提供 API Key 和接口地址');
    }

    return {
      baseUrl: this.normalizeBaseUrl(baseUrl),
      apiKey,
      modelName: dto.modelName ?? config?.modelName,
    };
  }

  private async testResolvedConfig(config: ResolvedAiConfig) {
    const startedAt = Date.now();

    try {
      const response = await fetch(`${this.normalizeBaseUrl(config.baseUrl)}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      const latencyMs = Date.now() - startedAt;

      if (!response.ok) {
        return {
          success: false,
          status: AiProviderTestStatus.FAILED,
          message: `连接失败，服务返回 HTTP ${response.status}`,
          latencyMs,
        };
      }

      return {
        success: true,
        status: AiProviderTestStatus.SUCCESS,
        message: '连接测试成功',
        latencyMs,
      };
    } catch (error) {
      return {
        success: false,
        status: AiProviderTestStatus.FAILED,
        message: error instanceof Error ? error.message : '连接测试失败',
        latencyMs: Date.now() - startedAt,
      };
    }
  }

  private applyTestResult(
    config: AiProviderConfigEntity,
    result: Awaited<ReturnType<AiSettingsService['testResolvedConfig']>>,
  ) {
    config.lastTestStatus = result.status;
    config.lastTestMessage = result.message.slice(0, 255);
    config.lastTestAt = new Date();
  }

  private toResponse(config: AiProviderConfigEntity | null) {
    if (!config) {
      return {
        configured: false,
        needsAiConfig: true,
      };
    }

    return {
      configured: true,
      needsAiConfig: !config.isEnabled,
      providerType: config.providerType,
      providerName: config.providerName,
      baseUrl: config.baseUrl,
      apiKeyMask: config.apiKeyMask,
      modelName: config.modelName,
      isEnabled: config.isEnabled,
      lastTestStatus: config.lastTestStatus,
      lastTestMessage: config.lastTestMessage,
      lastTestAt: config.lastTestAt,
      updatedAt: config.updatedAt,
    };
  }

  private normalizeBaseUrl(baseUrl: string) {
    return baseUrl.trim().replace(/\/+$/, '');
  }

  private maskApiKey(apiKey: string) {
    const trimmed = apiKey.trim();
    if (trimmed.length <= 8) {
      return `****${trimmed.slice(-4)}`;
    }
    return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
  }

  private encryptApiKey(apiKey: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(apiKey.trim(), 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  private decryptApiKey(encryptedValue: string) {
    const [ivText, authTagText, encryptedText] = encryptedValue.split(':');
    if (!ivText || !authTagText || !encryptedText) {
      throw new BadRequestException('API Key 加密数据格式不正确');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(ivText, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTagText, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }

  private getEncryptionKey() {
    const secret =
      process.env.AI_CONFIG_SECRET ??
      process.env.JWT_SECRET ??
      'zhijing-secret-key';

    return createHash('sha256').update(secret).digest();
  }
}
