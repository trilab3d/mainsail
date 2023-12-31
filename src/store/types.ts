import { SocketState } from '@/store/socket/types'
import { ServerState } from '@/store/server/types'
import { PrinterState } from '@/store/printer/types'
import { GuiState } from '@/store/gui/types'
import { EditorState } from '@/store/editor/types'
import { TrilabState } from './trilab/types'

export interface RootState {
    packageVersion: string
    debugMode: boolean
    naviDrawer: boolean | null
    instancesDB: 'moonraker' | 'browser' | 'json'
    configInstances: ConfigJsonInstance[]

    socket?: SocketState
    gui?: GuiState
    printer?: PrinterState
    server?: ServerState
    editor?: EditorState
    trilab?: TrilabState
}

export interface RootStateDependency {
    serviceName: string
    installedVersion: string
    neededVersion: string
}

export interface ConfigJson {
    hostname?: string | null
    port?: string | number | null
    instancesDB?: 'moonraker' | 'browser' | 'json'
    instances?: ConfigJsonInstance[]
}

export interface ConfigJsonInstance {
    hostname: string
    port?: number
}
