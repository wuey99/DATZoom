//------------------------------------------------------------------------------------------
import { XApp } from '../../engine/app/XApp';
import { XTask } from '../../engine/task/XTask';
import { XNumber } from '../../engine/task/XNumber';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class LayerUtils  {
	public static self:LayerUtils;

	//------------------------------------------------------------------------------------------
	public static instance ():LayerUtils {
        if (LayerUtils.self == null) {
            LayerUtils.self = new LayerUtils ();
        }

        return LayerUtils.self;
	}

	//------------------------------------------------------------------------------------------
	constructor () {
    }

    //------------------------------------------------------------------------------------------
    public static getXApp ():XApp {
        return G.XApp;
    }

    //------------------------------------------------------------------------------------------
    public static addShake (__callback:any, __count:number=15, __delayValue:number=0x0100):void {
        LayerUtils.instance ().__addShake (__callback, __count, __delayValue);   
    }

    //------------------------------------------------------------------------------------------
    public __addShake (__callback:any, __count:number=15, __delayValue:number=0x0100):void {        
        var __delay:XNumber = new XNumber (0);
        __delay.value = __delayValue;
        
        LayerUtils.getXApp ().getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                () => {__callback (-__count); }, XTask.WAIT, __delay,
                () => {__callback ( __count); }, XTask.WAIT, __delay,
                
                XTask.FLAGS, (__task:XTask) => {
                    __count--;
                    
                    __task.ifTrue (__count == 0);
                }, XTask.BNE, "loop",
                
                () => {
                    __callback (0);
                },
            
            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
}
