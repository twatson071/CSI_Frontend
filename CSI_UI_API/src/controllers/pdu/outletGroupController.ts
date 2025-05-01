import { Context } from 'hono';
import { OutletGroupState, OutletGroupStateRequest, OutletGroupStateResponse } from '../../types/pdu/types';

export const setOutletGroupState = async (c: Context) => {
    try {
        const service_name = c.req.param('service_name');
        const index = c.req.param('index');
        const { state } = await c.req.json() as OutletGroupStateRequest;

        // Validate the state
        if (!Object.values(OutletGroupState).includes(state)) {
            return c.json({
                success: false,
                message: 'Invalid outlet group state'
            }, 400);
        }

        // TODO: Implement actual PDU communication logic here
        // This is where you would make the actual call to the PDU device
        
        const response: OutletGroupStateResponse = {
            state,
            success: true,
            message: `Successfully set outlet group ${index} state to ${state}`
        };

        return c.json(response);
    } catch (error) {
        console.error('Error setting outlet group state:', error);
        return c.json({
            success: false,
            message: 'Internal server error'
        }, 500);
    }
};

export const getOutletGroupState = async (c: Context) => {
    try {
        const service_name = c.req.param('service_name');
        const index = c.req.param('index');

        // TODO: Implement actual PDU communication logic here
        // This is where you would make the actual call to the PDU device
        
        const response: OutletGroupStateResponse = {
            state: OutletGroupState.POWER_ON, // This should come from the actual PDU device
            success: true
        };

        return c.json(response);
    } catch (error) {
        console.error('Error getting outlet group state:', error);
        return c.json({
            success: false,
            message: 'Internal server error'
        }, 500);
    }
}; 