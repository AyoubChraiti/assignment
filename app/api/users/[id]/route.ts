import { respond } from '@/lib/http';
import { getUser, updateUser, deleteUser } from '@/services/users';
type Context = { params: Promise<{ id: string }> };
export function GET(_request: Request, context: Context) { return respond(async () => getUser((await context.params).id)); }
export function PATCH(request: Request, context: Context) { return respond(async () => updateUser((await context.params).id, await request.json())); }
export function DELETE(_request: Request, context: Context) { return respond(async () => deleteUser((await context.params).id), 204); }
