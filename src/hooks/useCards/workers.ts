import { wrap } from 'comlink'
import CanvasMeasureWorker, { api as cmApi } from './CanvasMeasure.worker'

// Instantiate worker
const canvasMeasure: Worker = new CanvasMeasureWorker()
export const canvasMeasureApi = wrap<typeof cmApi>(canvasMeasure)
