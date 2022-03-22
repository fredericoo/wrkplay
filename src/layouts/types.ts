import { NextPage } from 'next/types';
import { Sidebar } from '../components/Sidebar/types';

export type LayoutProps = {
  sidebar?: Sidebar;
};

export type LayoutComponent = React.FC<LayoutProps>;

export type PageWithLayout<P = {}> = NextPage<P> & { Layout: LayoutComponent };