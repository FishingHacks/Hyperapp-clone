export interface route {
    domain: string,
    app: VDOM
}

export type routeArray = Array<route>;

export interface vdomoptions {
    node?: HTMLElement;
    elements?: (state: {[name: string]: unknown})=>Array<VNode>;
    subscriptions?: Array<{
        name: string;
        invoke: (e: HEvent)=>void;
    }>;
    init?: {[name: string]: unknown};
    /**
     * Don't use it
     */
    dontRender?: boolean;
}