import fs from 'fs';
import path from 'path';

const SRC_DIR = '../SportZone eCommerce Website/src/app';
const DEST_DIR = './src';

// Map of old file paths (relative to app/) to new file paths (relative to Frontend/src/)
const fileMapping = {
  'pages/Home.tsx': 'pages/Home/index.tsx',
  'pages/Products.tsx': 'pages/Product/ProductList.tsx',
  'pages/ProductDetail.tsx': 'pages/Product/ProductDetail.tsx',
  'pages/Cart.tsx': 'pages/Cart/index.tsx',
  'pages/Checkout.tsx': 'pages/Checkout/index.tsx',
  'pages/OrderSuccess.tsx': 'pages/Checkout/OrderSuccess.tsx',
  'pages/OrderTracking.tsx': 'pages/Checkout/OrderTracking.tsx',
  'pages/Account.tsx': 'pages/Profile/index.tsx',
  'pages/Policy.tsx': 'pages/Policy/index.tsx',
  'pages/Returns.tsx': 'pages/Policy/Returns.tsx',
  'pages/Blog.tsx': 'pages/Blog/index.tsx',
  'pages/BlogDetail.tsx': 'pages/Blog/BlogDetail.tsx',
  'pages/NotFound.tsx': 'pages/NotFound/index.tsx',
  
  'components/Header.tsx': 'layouts/MainLayout/components/Header.tsx',
  'components/Footer.tsx': 'layouts/MainLayout/components/Footer.tsx',
  'components/Chatbot.tsx': 'layouts/MainLayout/components/Chatbot.tsx',
  'components/HamburgerMenu.tsx': 'layouts/MainLayout/components/HamburgerMenu.tsx',
  'components/Root.tsx': 'layouts/MainLayout/MainLayout.tsx',
  'components/ProductCard.tsx': 'components/common/ProductCard/ProductCard.tsx',
  
  'context/AppContext.tsx': 'context/AppContext.tsx',
  
  'data/products.ts': 'constants/productsData.ts',
  'data/blog.ts': 'constants/blogData.ts',
  
  'routes.ts': 'routes/index.tsx',
  'App.tsx': 'App.tsx'
};

// Map of old import literals to new absolute import literals
const baseImportMap = {
  '../context/AppContext': '@/context/AppContext',
  '../../context/AppContext': '@/context/AppContext',
  '../data/products': '@/constants/productsData',
  '../../data/products': '@/constants/productsData',
  '../../data/blog': '@/constants/blogData',
  '../data/blog': '@/constants/blogData',
  '../../app/data/blog': '@/constants/blogData',
  '../components/ProductCard': '@/components/common/ProductCard/ProductCard',
  '../../components/ProductCard': '@/components/common/ProductCard/ProductCard',
  '../components/Header': '@/layouts/MainLayout/components/Header',
  '../components/Footer': '@/layouts/MainLayout/components/Footer',
  '../components/Chatbot': '@/layouts/MainLayout/components/Chatbot',
  '../components/HamburgerMenu': '@/layouts/MainLayout/components/HamburgerMenu',
  '../components/Root': '@/layouts/MainLayout/MainLayout',
  './components/Root': '@/layouts/MainLayout/MainLayout',
  './pages/Home': '@/pages/Home',
  './pages/Products': '@/pages/Product/ProductList',
  './pages/ProductDetail': '@/pages/Product/ProductDetail',
  './pages/Cart': '@/pages/Cart',
  './pages/Checkout': '@/pages/Checkout',
  './pages/OrderSuccess': '@/pages/Checkout/OrderSuccess',
  './pages/OrderTracking': '@/pages/Checkout/OrderTracking',
  './pages/Account': '@/pages/Profile',
  './pages/Policy': '@/pages/Policy',
  './pages/Returns': '@/pages/Policy/Returns',
  './pages/Blog': '@/pages/Blog',
  './pages/BlogDetail': '@/pages/Blog/BlogDetail',
  './pages/NotFound': '@/pages/NotFound',
  './routes': '@/routes',
};

// Add implicit extension handler for routes mapping if any
for (const [oldPath, newPath] of Object.entries(fileMapping)) {
  const fullOldPath = path.resolve(SRC_DIR, oldPath);
  const fullNewPath = path.resolve(DEST_DIR, newPath);
  
  if (!fs.existsSync(fullOldPath)) {
     console.log('Skipping missing:', fullOldPath);
     continue;
  }
  
  fs.mkdirSync(path.dirname(fullNewPath), { recursive: true });
  
  let content = fs.readFileSync(fullOldPath, 'utf8');
  
  // Replace imports based on the old maps
  for (const [oldImport, newImport] of Object.entries(baseImportMap)) {
    const regexSafeOldImport = oldImport.replace(/\./g, '\\.');
    const matchRe = new RegExp(`from (['"])${regexSafeOldImport}(['"])`, 'g');
    content = content.replace(matchRe, `from $1${newImport}$2`);
    
    const matchRe2 = new RegExp(`import (['"])${regexSafeOldImport}(['"])`, 'g');
    content = content.replace(matchRe2, `import $1${newImport}$2`);

    const matchRe3 = new RegExp(`import\\((['"])${regexSafeOldImport}(['"])\\)`, 'g');
    content = content.replace(matchRe3, `import($1${newImport}$2)`);
  }

  // Self-folder imports within components
  if (oldPath.startsWith('components/')) {
    content = content.replace(/from (['"])\.\/ProductCard(['"])/g, 'from $1@/components/common/ProductCard/ProductCard$2');
    content = content.replace(/from (['"])\.\/Header(['"])/g, 'from $1@/layouts/MainLayout/components/Header$2');
    content = content.replace(/from (['"])\.\/Footer(['"])/g, 'from $1@/layouts/MainLayout/components/Footer$2');
    content = content.replace(/from (['"])\.\/Chatbot(['"])/g, 'from $1@/layouts/MainLayout/components/Chatbot$2');
    content = content.replace(/from (['"])\.\/HamburgerMenu(['"])/g, 'from $1@/layouts/MainLayout/components/HamburgerMenu$2');
  }

  // Remove `export { Account }` -> rename to `export default function Account` where applicable
  // Wait, no, we can just export functional components as they were, because `import { Home } from "./pages/Home"`
  // expects named exports. If they use named exports, I can leave them named. My routes mapping will just import the named export.
  
  fs.writeFileSync(fullNewPath, content);
  console.log(`Migrated ${oldPath} -> ${newPath}`);
}
