import { Menu } from '@/types/menu'

const menuData: Menu[] = [
  {
    id: 1,
    title: 'Projects',
    path: '/tasks',
    newTab: false,
  },
  {
    id: 2,
    title: 'Docs',
    path: 'https://l3a.gitbook.io/l3a-dao-documentation/getting-started/vision',
    newTab: true,
  },
  {
    id: 3,
    title: 'Governance & Forum',
    path: 'https://www.discourse.org/',
    newTab: true,
  },
  {
    id: 4,
    title: 'FAQs',
    path: '/',
    newTab: false,
  },
  {
    id: 5,
    title: 'Profile',
    path: '/profile',
    newTab: false,
  },
  // {
  //   id: 33,
  //   title: 'Blog',
  //   path: '/blog',
  //   newTab: false,
  // },
  // {
  //   id: 3,
  //   title: 'Support',
  //   path: '/contact',
  //   newTab: false,
  // },
  // {
  //   id: 4,
  //   title: 'Docs',
  //   newTab: false,
  //   submenu: [
  //     {
  //       id: 41,
  //       title: 'About Page',
  //       path: '/about',
  //       newTab: false,
  //     },
  //     {
  //       id: 42,
  //       title: 'Contact Page',
  //       path: '/contact',
  //       newTab: false,
  //     },
  //     {
  //       id: 43,
  //       title: 'Blog Grid Page',
  //       path: '/blog',
  //       newTab: false,
  //     },
  //     {
  //       id: 44,
  //       title: 'Blog Sidebar Page',
  //       path: '/blog-sidebar',
  //       newTab: false,
  //     },
  //     {
  //       id: 45,
  //       title: 'Blog Details Page',
  //       path: '/blog-details',
  //       newTab: false,
  //     },
  //     {
  //       id: 46,
  //       title: 'Sign In Page',
  //       path: '/signin',
  //       newTab: false,
  //     },
  //     {
  //       id: 47,
  //       title: 'Sign Up Page',
  //       path: '/signup',
  //       newTab: false,
  //     },
  //     {
  //       id: 48,
  //       title: 'Error Page',
  //       path: '/error',
  //       newTab: false,
  //     },
  //   ],
  // },
]
export default menuData
