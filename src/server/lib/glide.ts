import { GlideRecord } from '@servicenow/glide'

/**
 * Untyped GlideRecord factory, for platform tables whose generated field typings are not part of
 * this project. Use GlideRecordSecure (not this) for anything that returns data to the user.
 */
export function gr(table: string): any {
    return new GlideRecord(table) as any
}
