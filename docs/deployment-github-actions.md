# zhijing-api GitHub Actions 部署说明

这套配置会在 `main` 或 `master` 分支的 `zhijing-api/**` 发生变更后自动构建后端，并通过 SSH 发布到服务器。

## 服务器准备

服务器公网地址：`43.139.91.62`

GitHub Actions 默认会连接 `43.139.91.62`。如果后续服务器 IP 变化，可以在 GitHub Secrets 中配置 `SERVER_HOST` 覆盖默认地址。

在服务器上安装运行环境：

```bash
# Node.js 建议 20.x
node -v
npm -v

# 安装 PM2
npm install -g pm2

# 创建部署目录
mkdir -p /var/www/zhijing-api/shared
```

首次部署后，workflow 会自动创建：

```text
/var/www/zhijing-api/
  current -> releases/<commit-sha>
  releases/
  shared/.env
```

请在服务器上编辑 `/var/www/zhijing-api/shared/.env`，填入生产数据库、JWT 等配置。

## GitHub Secrets

在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 中添加：

| Secret | 示例 | 说明 |
| --- | --- | --- |
| `SERVER_HOST` | `43.139.91.62` | 可选，服务器公网地址；不填默认使用 `43.139.91.62` |
| `SERVER_USER` | `root` 或部署用户 | SSH 登录用户 |
| `SERVER_SSH_KEY` | 私钥内容 | 对应服务器 `~/.ssh/authorized_keys` 的私钥 |
| `SERVER_PORT` | `22` | 可选，不填默认 `22` |
| `DEPLOY_PATH` | `/var/www/zhijing-api` | 可选，不填使用该默认路径 |

## 手动部署

配置完成后可以在 GitHub Actions 页面手动运行 `Deploy zhijing-api`，或直接 push 到 `main` / `master` 触发部署。

服务由 PM2 管理：

```bash
pm2 status
pm2 logs zhijing-api
pm2 restart zhijing-api
```
