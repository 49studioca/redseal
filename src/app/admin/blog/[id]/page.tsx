import { BlogEditorForm } from "@/components/admin/blog-editor-form";

export default async function EditBlogPostPage(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;
  return (
    <div className="min-h-screen bg-[#F6F3EE]">
      <BlogEditorForm postId={id} />
    </div>
  );
}
