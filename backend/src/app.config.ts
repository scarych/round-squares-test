import { TypeOrmModule } from '@nestjs/typeorm';

const { PG_DB_HOST, PG_DB_PORT, PG_DB_USER, PG_DB_PASSWORD, PG_DB_NAME } =
  process.env;

const { NODE_ENV } = process.env;

export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';

export const PgTypeOrm = TypeOrmModule.forRoot({
  type: 'postgres',
  host: PG_DB_HOST,
  port: Number(PG_DB_PORT),
  username: PG_DB_USER,
  password: PG_DB_PASSWORD,
  database: PG_DB_NAME,
  entities: [],
  autoLoadEntities: true,
  synchronize: isDevelopment,
});
