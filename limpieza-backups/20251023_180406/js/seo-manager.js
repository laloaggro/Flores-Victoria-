// SEO Manager (placeholder)
class SEOManager {
  setTitle(title) {
    document.title = title;
  }
  setMeta(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }
}

const seoManager = new SEOManager();
export default seoManager;
