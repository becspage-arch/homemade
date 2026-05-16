import { redirect } from 'next/navigation'

/**
 * Phase admin-overhaul — sub-categories merged into the categories tree view.
 */
export default function SubCategoriesRedirectPage() {
  redirect('/admin/categories')
}
