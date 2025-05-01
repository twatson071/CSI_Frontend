export enum OutletGroupState {
    POWER_ON = 'POWER_ON',
    POWER_OFF = 'POWER_OFF',
    POWER_MIXED = 'POWER_MIXED',
    REBOOT = 'REBOOT'
}

export interface OutletGroupStateRequest {
    state: OutletGroupState;
}

export interface OutletGroupStateResponse {
    state: OutletGroupState;
    success: boolean;
    message?: string;
} 