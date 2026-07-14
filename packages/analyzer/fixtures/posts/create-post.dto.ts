// VIOLATION: no class-validator decorators — fields are not validated.
export class CreatePostDto {
  title: string;
  body: string;
}
