import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
export async function respond(action: () => Promise<unknown>, status = 200) {
  try {
    const result = await action();
    return status === 204 ? new Response(null, { status }) : Response.json(result, { status });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: error.issues.map(i => `${i.path.join('.') || 'Input'}: ${i.message}`).join(' ') }, { status: 400 });
    if (error instanceof SyntaxError) return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return Response.json({ error: 'Email already exists.' }, { status: 409 });
      if (error.code === 'P2025') return Response.json({ error: 'User not found.' }, { status: 404 });
    }
    console.error(error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
