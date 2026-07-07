#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${ARTIFACT_NAME:?ARTIFACT_NAME is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

RELEASE_DIR="${DEPLOY_PATH}/releases/${GITHUB_SHA}"
CURRENT_DIR="${DEPLOY_PATH}/current"
SHARED_DIR="${DEPLOY_PATH}/shared"
SHARED_ENV="${SHARED_DIR}/.env"
MYSQL_INIT_DIR="${SHARED_DIR}/mysql-init"
MYSQL_INIT_SQL="${MYSQL_INIT_DIR}/01-create-mysql.sql"

set_env_value() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "${SHARED_ENV}"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "${SHARED_ENV}"
  else
    printf '\n%s=%s\n' "${key}" "${value}" >> "${SHARED_ENV}"
  fi
}

choose_mysql_port() {
  local port

  for port in 3307 3308 3309 3310 3311 3312 3313 3314 3315; do
    if ! ss -ltn | awk '{print $4}' | grep -Eq "[:.]${port}$"; then
      echo "${port}"
      return 0
    fi
  done

  echo "No free local MySQL port found in 3307-3315." >&2
  exit 1
}

mkdir -p "${RELEASE_DIR}" "${SHARED_DIR}" "${MYSQL_INIT_DIR}"
tar -xzf "/tmp/${ARTIFACT_NAME}" -C "${RELEASE_DIR}"
rm -f "/tmp/${ARTIFACT_NAME}"

if [ ! -f "${SHARED_ENV}" ]; then
  cp "${RELEASE_DIR}/.env.example" "${SHARED_ENV}"
  echo "Created ${SHARED_ENV}; update it with production database/JWT values before serving traffic."
fi

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available on the server. Install Docker Engine with the Compose plugin first."
  exit 1
fi

docker rm -f zhijing-mysql >/dev/null 2>&1 || true

MYSQL_PORT_VALUE="$(choose_mysql_port)"
echo "Using local MySQL host port ${MYSQL_PORT_VALUE}."

set_env_value DB_HOST 127.0.0.1
set_env_value DB_PORT "${MYSQL_PORT_VALUE}"
set_env_value MYSQL_PORT "${MYSQL_PORT_VALUE}"

ln -sfnT "${SHARED_ENV}" "${RELEASE_DIR}/.env"
cp "${RELEASE_DIR}/sql/create_mysql.sql" "${MYSQL_INIT_SQL}"

cd "${RELEASE_DIR}"
MYSQL_INIT_SQL_PATH="${MYSQL_INIT_SQL}" docker compose up -d mysql

for i in $(seq 1 30); do
  if docker compose exec -T mysql sh -c 'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' >/dev/null 2>&1; then
    break
  fi

  if [ "${i}" -eq 30 ]; then
    echo "MySQL did not become healthy in time."
    docker compose logs mysql
    exit 1
  fi

  sleep 2
done

npm ci --omit=dev

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is not installed on the server. Run: npm install -g pm2"
  exit 1
fi

ln -sfnT "${RELEASE_DIR}" "${CURRENT_DIR}"
cd "${CURRENT_DIR}"
pm2 delete zhijing-api >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --env production
pm2 save

ACTIVE_RELEASE="$(readlink -f "${CURRENT_DIR}" || true)"
find "${DEPLOY_PATH}/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -rn \
  | awk -v active="${ACTIVE_RELEASE}" '{ sub(/^[^ ]+ /, ""); if ($0 != active) print }' \
  | tail -n +5 \
  | while IFS= read -r old_release; do
      rm -rf -- "${old_release}"
    done
