import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import {
  AiProviderTestStatus,
  AiProviderType,
} from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'ai_provider_configs' })
export class AiProviderConfigEntity extends AbstractEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({
    name: 'provider_type',
    type: 'enum',
    enum: AiProviderType,
    default: AiProviderType.OPENAI_COMPATIBLE,
  })
  providerType: AiProviderType;

  @Column({ name: 'provider_name', length: 80, default: 'OpenAI Compatible' })
  providerName: string;

  @Column({ name: 'base_url', length: 255 })
  baseUrl: string;

  @Column({ name: 'api_key_encrypted', type: 'longtext' })
  apiKeyEncrypted: string;

  @Column({ name: 'api_key_mask', length: 40 })
  apiKeyMask: string;

  @Column({ name: 'model_name', length: 120, nullable: true })
  modelName?: string | null;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({
    name: 'last_test_status',
    type: 'enum',
    enum: AiProviderTestStatus,
    default: AiProviderTestStatus.UNTESTED,
  })
  lastTestStatus: AiProviderTestStatus;

  @Column({ name: 'last_test_message', type: 'varchar', length: 255, nullable: true })
  lastTestMessage?: string | null;

  @Column({ name: 'last_test_at', type: 'datetime', nullable: true })
  lastTestAt?: Date | null;

  @OneToOne(() => UserEntity, (user) => user.aiProviderConfig)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
