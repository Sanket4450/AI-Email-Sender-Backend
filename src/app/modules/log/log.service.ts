import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateLLMLogDto } from './dto/create-llm-log.dto';
import { CreateWebhookLogDto } from './dto/create-webhook-log.dto';
import { responseBuilder } from 'src/app/utils/responseBuilder';
import { ERROR_MSG, SUCCESS_MSG } from 'src/app/utils/messages';
import { GetLogsDto } from './dto/get-logs.dto';
import { getPagination, getSearchCond } from 'src/app/utils/common.utils';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { Prisma } from '@prisma/client';
import { QueryResponse } from 'src/app/types/common.type';
import { LogQuery } from './log.query';
import { LOG_TYPES } from 'src/app/utils/constants';
import { DeleteLogDto } from './dto/delete-log.dto';
import { LLMLog, WebhookLog } from 'prisma/generated';

@Injectable()
export class LogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logQuery: LogQuery,
  ) {}

  // Create a new LLM log
  async createLLMLog(body: CreateLLMLogDto) {
    await this.prisma.lLMLog.create({ data: body });
  }

  // Create a new Webhook log
  async createWebhookLog(body: CreateWebhookLogDto) {
    await this.prisma.webhookLog.create({ data: body });
  }

  // Delete an log by ID
  async deleteLog(id: string, query: DeleteLogDto) {
    await this.logExists(id, query.type);

    if (query.type === LOG_TYPES.LLM) {
      await this.prisma.lLMLog.delete({ where: { id } });
    } else {
      await this.prisma.webhookLog.delete({ where: { id } });
    }

    return responseBuilder({ message: SUCCESS_MSG.LOG_DELETED });
  }

  // Delete an log by ID
  async deleteAllLogs(query: DeleteLogDto) {
    if (query.type === LOG_TYPES.LLM) {
      await this.prisma.lLMLog.delete({ where: undefined });
    } else {
      await this.prisma.webhookLog.delete({ where: undefined });
    }

    return responseBuilder({ message: SUCCESS_MSG.LOG_DELETED });
  }

  // Get all logs
  async getLogs(query: GetLogsDto) {
    const { type, search } = query;
    const { offset, limit } = getPagination(query);

    const conditions: Prisma.Sql[] = [];

    if (search) {
      const searchKeys = ['l.title'];
      conditions.push(getSearchCond(search, searchKeys));
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;

    const tableName = type === LOG_TYPES.LLM ? 'llm_log' : 'webhook_log';

    const rawQuery = Prisma.sql`
      WITH "LogCount" AS (
        SELECT
          COUNT(l.id)::INT AS "count"
        FROM ${tableName} t
        ${whereClause}
      ),
      
      "Logs" AS (
        SELECT
          ${this.logQuery.getLogSelectFields(type)}
        FROM ${tableName} t
        ${whereClause}
        ORDER BY l."createdAt"
        OFFSET ${offset}
        LIMIT ${limit}
      )
      
      SELECT
        (SELECT "count" FROM "LogCount") AS "count",
        COALESCE((SELECT JSON_AGG("Logs") FROM "Logs"), '[]'::JSON) AS "data";
    `;

    const [LogResponse] =
      await this.prisma.$queryRaw<QueryResponse<LLMLog | WebhookLog>>(rawQuery);

    return responseBuilder({
      message: SUCCESS_MSG.LOGS_FETCHED,
      result: LogResponse,
    });
  }

  // Check if a log exists
  async logExists(id: string, type: string) {
    let log = null;

    if (type === LOG_TYPES.LLM) {
      log = await this.prisma.lLMLog.findUnique({
        where: { id },
      });
    } else {
      log = await this.prisma.webhookLog.findUnique({
        where: { id },
      });
    }

    if (!log) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ERROR_MSG.LOG_NOT_FOUND,
      );
    }

    return log;
  }
}
