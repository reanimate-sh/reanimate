import { NextResponse } from "next/server";

export type ApiSuccess<T extends Record<string, unknown>> = { success: true } & T;

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T extends Record<string, unknown>> = ApiSuccess<T> | ApiError;

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  init?: ResponseInit
) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, ...data }, init);
}

export function apiError(error: string, status: number, code?: string) {
  return NextResponse.json<ApiError>(
    { success: false, error, ...(code ? { code } : {}) },
    { status }
  );
}
