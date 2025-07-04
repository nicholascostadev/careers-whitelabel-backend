import { UnauthorizedException } from "@/exceptions/unauthorized-exception.js";
import type { RefreshTokenDTO } from "@/lib/dtos/refresh-token.dto.js";
import { makeRefreshTokenService } from "@/services/factories/make-refresh-token-service.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";

export const RefreshAccessTokenResponseSchema = {
	200: z.object({
		accessToken: z.string(),
	}),
	401: z.object({
		message: z.string(),
	}),
};

type RefreshAccessTokenReplyType = {
	[statusCode in keyof typeof RefreshAccessTokenResponseSchema]: z.infer<
		(typeof RefreshAccessTokenResponseSchema)[statusCode]
	>;
};

export type RefreshAccessTokenRequest = FastifyRequest<{
	Reply: RefreshAccessTokenReplyType;
}>;

export type RefreshAccessTokenReply = FastifyReply<{
	Reply: RefreshAccessTokenReplyType;
}>;

export async function refreshAccessTokenController(
	request: RefreshAccessTokenRequest,
	reply: RefreshAccessTokenReply,
) {
	const refreshTokenCookie = request.cookies.refreshToken;

	if (!refreshTokenCookie) {
		throw new UnauthorizedException();
	}

	const refreshTokenDTO: RefreshTokenDTO = {
		refreshToken: refreshTokenCookie,
	};

	const refreshTokenService = makeRefreshTokenService();

	const { accessToken, refreshToken } =
		await refreshTokenService.execute(refreshTokenDTO);

	reply.setCookie("refreshToken", refreshToken, {
		httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
		secure: false, // Set to true in production with HTTPS for secure transmission
		sameSite: "strict", // Protects against CSRF attacks
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
	});

	return reply.status(200).send({
		accessToken,
	});
}
