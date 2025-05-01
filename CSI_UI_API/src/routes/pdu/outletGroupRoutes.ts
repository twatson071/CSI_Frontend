import { Hono } from 'hono';
import { setOutletGroupState, getOutletGroupState } from '../../controllers/pdu/outletGroupController';

const router = new Hono();

// GET /:service_name/parameters/outlet_groups/:index/state
router.get('/:service_name/parameters/outlet_groups/:index/state', getOutletGroupState);

// POST /:service_name/parameters/outlet_groups/:index/state
router.post('/:service_name/parameters/outlet_groups/:index/state', setOutletGroupState);

export default router; 