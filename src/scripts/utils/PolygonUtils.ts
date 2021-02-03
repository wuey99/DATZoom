//------------------------------------------------------------------------------------------
import { XApp } from '../../engine/app/XApp';
import { XTask } from '../../engine/task/XTask';
import { XNumber } from '../../engine/task/XNumber';
import { G } from '../../engine/app/G';
const polygonClipping = require('polygon-clipping');

//------------------------------------------------------------------------------------------
export class PolygonUtils  {
	public static self:PolygonUtils;

	//------------------------------------------------------------------------------------------
	public static instance ():PolygonUtils {
        if (PolygonUtils.self == null) {
            PolygonUtils.self = new PolygonUtils ();
        }

        return PolygonUtils.self;
	}

	//------------------------------------------------------------------------------------------
	constructor () {
    }

    //------------------------------------------------------------------------------------------
    public static getXApp ():XApp {
        return G.XApp;
    }

    //------------------------------------------------------------------------------------------
    public union (__polygon:any):any {
        return polygonClipping.union (__polygon);
    }

//------------------------------------------------------------------------------------------
}