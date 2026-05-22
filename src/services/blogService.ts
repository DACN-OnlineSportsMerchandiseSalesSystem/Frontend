import api from './api';

export interface BlogPostDTO {
  id?: number;
  slug: string;
  title: string;
  category: string;
  sport: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string;
  imageUrl: string;
  publishDate?: string;
  views?: number;
  status?: "published" | "draft";
}

const blogService = {
  getAllBlogs: async () => {
    const response = await api.get<BlogPostDTO[]>('/blogs');
    return response.data;
  },

  getBlogBySlug: async (slug: string) => {
    const response = await api.get<BlogPostDTO>(`/blogs/${slug}`);
    return response.data;
  },

  createBlog: async (data: BlogPostDTO) => {
    const response = await api.post<BlogPostDTO>('/blogs', data);
    return response.data;
  },

  updateBlog: async (id: number, data: Partial<BlogPostDTO>) => {
    const response = await api.put<BlogPostDTO>(`/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id: number) => {
    await api.delete(`/blogs/${id}`);
  }
};

export default blogService;
