/* eslint-disable */
// @ts-nocheck
// Auto-generated style route tree for Jaguar mock frontend.

import { Route as rootRouteImport } from './routes/__root'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AlterarSenhaRouteImport } from './routes/alterar-senha'
import { Route as ClientesRouteImport } from './routes/clientes'
import { Route as OrcamentosRouteImport } from './routes/orcamentos'
import { Route as EstoqueRouteImport } from './routes/estoque'
import { Route as FinanceiroRouteImport } from './routes/financeiro'
import { Route as FornecedoresRouteImport } from './routes/fornecedores'
import { Route as RelatoriosRouteImport } from './routes/relatorios'
import { Route as ConfiguracoesRouteImport } from './routes/configuracoes'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ClientesClienteIdRouteImport } from './routes/clientes_.$clienteId'
import { Route as OrcamentosOrcamentoIdRouteImport } from './routes/orcamentos_.$orcamentoId'
import { Route as OrcamentosNovoRouteImport } from './routes/orcamentos_.novo'

const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const AlterarSenhaRoute = AlterarSenhaRouteImport.update({ id: '/alterar-senha', path: '/alterar-senha', getParentRoute: () => rootRouteImport } as any)
const ClientesRoute = ClientesRouteImport.update({ id: '/clientes', path: '/clientes', getParentRoute: () => rootRouteImport } as any)
const OrcamentosRoute = OrcamentosRouteImport.update({ id: '/orcamentos', path: '/orcamentos', getParentRoute: () => rootRouteImport } as any)
const EstoqueRoute = EstoqueRouteImport.update({ id: '/estoque', path: '/estoque', getParentRoute: () => rootRouteImport } as any)
const FinanceiroRoute = FinanceiroRouteImport.update({ id: '/financeiro', path: '/financeiro', getParentRoute: () => rootRouteImport } as any)
const FornecedoresRoute = FornecedoresRouteImport.update({ id: '/fornecedores', path: '/fornecedores', getParentRoute: () => rootRouteImport } as any)
const RelatoriosRoute = RelatoriosRouteImport.update({ id: '/relatorios', path: '/relatorios', getParentRoute: () => rootRouteImport } as any)
const ConfiguracoesRoute = ConfiguracoesRouteImport.update({ id: '/configuracoes', path: '/configuracoes', getParentRoute: () => rootRouteImport } as any)
const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const ClientesClienteIdRoute = ClientesClienteIdRouteImport.update({ id: '/clientes_/$clienteId', path: '/clientes/$clienteId', getParentRoute: () => rootRouteImport } as any)
const OrcamentosOrcamentoIdRoute = OrcamentosOrcamentoIdRouteImport.update({ id: '/orcamentos_/$orcamentoId', path: '/orcamentos/$orcamentoId', getParentRoute: () => rootRouteImport } as any)
const OrcamentosNovoRoute = OrcamentosNovoRouteImport.update({ id: '/orcamentos_/novo', path: '/orcamentos/novo', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/login': typeof LoginRoute
  '/alterar-senha': typeof AlterarSenhaRoute
  '/': typeof IndexRoute
  '/clientes': typeof ClientesRoute
  '/clientes/$clienteId': typeof ClientesClienteIdRoute
  '/orcamentos': typeof OrcamentosRoute
  '/orcamentos/$orcamentoId': typeof OrcamentosOrcamentoIdRoute
  '/orcamentos/novo': typeof OrcamentosNovoRoute
  '/estoque': typeof EstoqueRoute
  '/financeiro': typeof FinanceiroRoute
  '/fornecedores': typeof FornecedoresRoute
  '/relatorios': typeof RelatoriosRoute
  '/configuracoes': typeof ConfiguracoesRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/login': typeof LoginRoute
  '/alterar-senha': typeof AlterarSenhaRoute
  '/': typeof IndexRoute
  '/clientes': typeof ClientesRoute
  '/clientes_/$clienteId': typeof ClientesClienteIdRoute
  '/orcamentos': typeof OrcamentosRoute
  '/orcamentos_/$orcamentoId': typeof OrcamentosOrcamentoIdRoute
  '/orcamentos_/novo': typeof OrcamentosNovoRoute
  '/estoque': typeof EstoqueRoute
  '/financeiro': typeof FinanceiroRoute
  '/fornecedores': typeof FornecedoresRoute
  '/relatorios': typeof RelatoriosRoute
  '/configuracoes': typeof ConfiguracoesRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: keyof FileRoutesByFullPath
  fileRoutesByTo: FileRoutesByTo
  to: keyof FileRoutesByTo
  id: keyof FileRoutesById
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  LoginRoute: typeof LoginRoute
  AlterarSenhaRoute: typeof AlterarSenhaRoute
  IndexRoute: typeof IndexRoute
  ClientesRoute: typeof ClientesRoute
  OrcamentosRoute: typeof OrcamentosRoute
  EstoqueRoute: typeof EstoqueRoute
  FinanceiroRoute: typeof FinanceiroRoute
  FornecedoresRoute: typeof FornecedoresRoute
  RelatoriosRoute: typeof RelatoriosRoute
  ConfiguracoesRoute: typeof ConfiguracoesRoute
  ClientesClienteIdRoute: typeof ClientesClienteIdRoute
  OrcamentosOrcamentoIdRoute: typeof OrcamentosOrcamentoIdRoute
  OrcamentosNovoRoute: typeof OrcamentosNovoRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/alterar-senha': { id: '/alterar-senha'; path: '/alterar-senha'; fullPath: '/alterar-senha'; preLoaderRoute: typeof AlterarSenhaRouteImport; parentRoute: typeof rootRouteImport }
    '/clientes': { id: '/clientes'; path: '/clientes'; fullPath: '/clientes'; preLoaderRoute: typeof ClientesRouteImport; parentRoute: typeof rootRouteImport }
    '/clientes_/$clienteId': { id: '/clientes_/$clienteId'; path: '/clientes/$clienteId'; fullPath: '/clientes/$clienteId'; preLoaderRoute: typeof ClientesClienteIdRouteImport; parentRoute: typeof rootRouteImport }
    '/orcamentos': { id: '/orcamentos'; path: '/orcamentos'; fullPath: '/orcamentos'; preLoaderRoute: typeof OrcamentosRouteImport; parentRoute: typeof rootRouteImport }
    '/orcamentos_/$orcamentoId': { id: '/orcamentos_/$orcamentoId'; path: '/orcamentos/$orcamentoId'; fullPath: '/orcamentos/$orcamentoId'; preLoaderRoute: typeof OrcamentosOrcamentoIdRouteImport; parentRoute: typeof rootRouteImport }
    '/orcamentos_/novo': { id: '/orcamentos_/novo'; path: '/orcamentos/novo'; fullPath: '/orcamentos/novo'; preLoaderRoute: typeof OrcamentosNovoRouteImport; parentRoute: typeof rootRouteImport }
    '/estoque': { id: '/estoque'; path: '/estoque'; fullPath: '/estoque'; preLoaderRoute: typeof EstoqueRouteImport; parentRoute: typeof rootRouteImport }
    '/financeiro': { id: '/financeiro'; path: '/financeiro'; fullPath: '/financeiro'; preLoaderRoute: typeof FinanceiroRouteImport; parentRoute: typeof rootRouteImport }
    '/fornecedores': { id: '/fornecedores'; path: '/fornecedores'; fullPath: '/fornecedores'; preLoaderRoute: typeof FornecedoresRouteImport; parentRoute: typeof rootRouteImport }
    '/relatorios': { id: '/relatorios'; path: '/relatorios'; fullPath: '/relatorios'; preLoaderRoute: typeof RelatoriosRouteImport; parentRoute: typeof rootRouteImport }
    '/configuracoes': { id: '/configuracoes'; path: '/configuracoes'; fullPath: '/configuracoes'; preLoaderRoute: typeof ConfiguracoesRouteImport; parentRoute: typeof rootRouteImport }
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  LoginRoute,
  AlterarSenhaRoute,
  IndexRoute,
  ClientesRoute,
  OrcamentosRoute,
  EstoqueRoute,
  FinanceiroRoute,
  FornecedoresRoute,
  RelatoriosRoute,
  ConfiguracoesRoute,
  ClientesClienteIdRoute,
  OrcamentosOrcamentoIdRoute,
  OrcamentosNovoRoute,
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
