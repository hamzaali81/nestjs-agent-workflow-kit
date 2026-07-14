// An interface cannot be validated at runtime — using it as @Body() is a violation.
export interface UpdateUserPayload {
  id: string;
  name: string;
}
