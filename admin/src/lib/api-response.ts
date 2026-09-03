import { NextResponse } from "next/server";
import { ApiResponse } from "../types/mobile-api";

export function apiSuccess<T>(data: T, message?: string, pagination?: ApiResponse['pagination']) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };
  return NextResponse.json(body, { status: 200 });
}

export function apiCreated<T>(data: T, message?: string) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(body, { status: 201 });
}

export function apiError(error: string, status: number = 400) {
  const body: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(body, { status });
}

export function apiUnauthorized(error: string = "Unauthorized. Invalid or missing token.") {
  return apiError(error, 401);
}

export function apiNotFound(error: string = "Resource not found.") {
  return apiError(error, 404);
}
