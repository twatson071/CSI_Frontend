import { Hono } from 'hono';
import { postToggleOutlet } from '../../controllers/pdu/tripplitePDUController';
import { getTrippLiteData } from '../../controllers/pdu/tripplitePDUController';
const tripplitePDURoutes = new Hono();

tripplitePDURoutes.post('/csi_tripplite_pdumh20', postToggleOutlet);
tripplitePDURoutes.get('/csi_tripplite_pdumh20', getTrippLiteData);


export default tripplitePDURoutes;