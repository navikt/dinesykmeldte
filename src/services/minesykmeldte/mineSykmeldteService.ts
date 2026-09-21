import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { ZodTypeAny, z } from "zod";
import {
  type PreviewSykmeldt,
  ReadType,
  type Soknad,
  type Sykmelding,
  type Virksomhet,
} from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getServerEnv } from "../../utils/env";
import { MessageResponseSchema } from "./schema/common";
import { SoknadSchema } from "./schema/soknad";
import { SykmeldingSchema } from "./schema/sykmelding";
import { MineSykmeldteApiSchema } from "./schema/sykmeldt";
import { VirksomheterApiSchema } from "./schema/virksomhet";

const getMarkReadPath = (type: ReadType, id: string): string => {
  switch (type) {
    case ReadType.Hendelse:
    case ReadType.Aktivitetsvarsel:
      return `hendelse/${id}/lest`;
    case ReadType.Soknad:
      return `soknad/${id}/lest`;
    case ReadType.Sykmelding:
      return `sykmelding/${id}/lest`;
  }
};

export async function markRead(
  type: ReadType,
  id: string,
  context: ResolverContextType,
): Promise<boolean> {
  const [result, statusCode] = await fetchMineSykmeldteBackend({
    context,
    path: getMarkReadPath(type, id),
    schema: MessageResponseSchema,
    method: "PUT",
  });

  logger.info(
    `Marking ${type} with id ${id} as read, resulted in: ${result.message}`,
  );
  if (statusCode !== 200) {
    throw new Error(result.message);
  }

  return true;
}

export async function unlinkSykmeldt(
  sykmeldtId: string,
  context: ResolverContextType,
): Promise<boolean> {
  const [result, statusCode] = await fetchMineSykmeldteBackend({
    context,
    path: `narmesteleder/${sykmeldtId}/avkreft`,
    schema: MessageResponseSchema,
    method: "POST",
  });

  if (statusCode !== 200) {
    throw new Error(result.message);
  }

  return true;
}

export async function markAllSykmeldingerAndSoknaderAsRead(
  context: ResolverContextType,
): Promise<boolean> {
  const [result, statusCode] = await fetchMineSykmeldteBackend({
    context,
    path: "hendelser/read",
    schema: MessageResponseSchema,
    method: "PUT",
  });
  logger.info(
    `Mark all sykmeldinger and soknader as read for nærmesteleder, result in ${result.message}`,
  );
  if (statusCode !== 200) {
    throw new Error(result.message);
  }

  return true;
}

export async function getVirksomheter(
  context: ResolverContextType,
): Promise<Virksomhet[]> {
  const [result] = await fetchMineSykmeldteBackend({
    context,
    path: "virksomheter",
    schema: VirksomheterApiSchema,
  });

  return result;
}

export async function getMineSykmeldte(
  context: ResolverContextType,
): Promise<PreviewSykmeldt[]> {
  const [result] = await fetchMineSykmeldteBackend({
    context,
    path: "minesykmeldte",
    schema: MineSykmeldteApiSchema,
  });

  return result;
}

export async function getSykmelding(
  sykmeldingId: string,
  context: ResolverContextType,
): Promise<Sykmelding> {
  const [result] = await fetchMineSykmeldteBackend({
    context,
    path: `sykmelding/${sykmeldingId}`,
    schema: SykmeldingSchema,
  });

  return result;
}

export async function getSoknad(
  soknadId: string,
  context: ResolverContextType,
): Promise<Soknad> {
  const [result] = await fetchMineSykmeldteBackend({
    context,
    path: `soknad/${soknadId}`,
    schema: SoknadSchema,
  });

  return result;
}

async function fetchMineSykmeldteBackend<SchemaType extends ZodTypeAny>({
  context,
  path,
  schema,
  method = "GET",
}: {
  context: ResolverContextType;
  path: string;
  schema: SchemaType;
  method?: string;
}): Promise<[result: z.infer<SchemaType>, httpStatus: number]> {
  const oboResult = await requestOboToken(
    context.accessToken,
    getServerEnv().DINE_SYKMELDTE_BACKEND_SCOPE,
  ).catch((cause: unknown) => {
    throw Object.assign(
      new Error("Dine sykmeldte token exchange failed", { cause }),
      { failure_stage: "token_exchange" },
    );
  });
  if (!oboResult.ok) {
    throw Object.assign(
      new Error("Dine sykmeldte token exchange failed", {
        cause: oboResult.error,
      }),
      { failure_stage: "token_exchange" },
    );
  }

  const response = await fetch(
    `${getServerEnv().DINE_SYKMELDTE_BACKEND_URL}/api/${path}`,
    {
      method,
      headers: {
        "x-request-id": context.xRequestId ?? "unknown",
        Authorization: `Bearer ${oboResult.token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 401) {
    throw Object.assign(
      new Error("Users access to Dine sykmeldte API has expired"),
      { upstream_status: 401, failure_stage: "response" },
    );
  }

  if (!response.ok) {
    throw Object.assign(new Error("Dine sykmeldte backend request failed"), {
      upstream_status: response.status,
      failure_stage: "response",
    });
  }

  const responseJson = await getJsonBody(response);
  const result = schema.safeParse(responseJson);
  if (result.success) {
    logger.info(
      `Backend: ${response.status} ${response.statusText} for ${path}`,
    );
    return [result.data, response.status];
  }

  throw Object.assign(
    new Error("Dine sykmeldte response did not match expected schema", {
      cause: result.error,
    }),
    { upstream_status: response.status, failure_stage: "response_validation" },
  );
}

async function getJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (cause) {
    throw Object.assign(
      new Error("Dine sykmeldte backend did not return valid JSON", { cause }),
      { upstream_status: response.status, failure_stage: "response_parse" },
    );
  }
}
