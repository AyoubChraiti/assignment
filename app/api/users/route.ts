import { respond } from '@/lib/http';
import { createUser, listUsers } from '@/services/users';
export function GET(request: Request) {
  return respond(() => listUsers(Object.fromEntries(new URL(request.url).searchParams)));
}
export function POST(request: Request) { return respond(async () => createUser(await request.json()), 201); }
