//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XButton } from '../../engine/ui/XButton';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { Box } from '../ui/Box';
import { HBox } from '../ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../ui/XJustify';
import { Spacer } from '../ui/Spacer';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { XMLSprite } from './XMLSprite';

//------------------------------------------------------------------------------------------
export class XMLAnimatedSprite extends XMLSprite {

//------------------------------------------------------------------------------------------
    public createSprites (__params:Array<any> = null):void {
        var __assetName:string = __params[0];
        var __scaleX:number = __params[1];
        var __scaleY:number = __params[2];

        this.m_sprite = this.createAnimatedSprite (__assetName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);
        this.scale.x = __scaleX;
        this.scale.y = __scaleY;
        
        this.show ();
    }

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
						XTask.GOTO, "loop",
						
					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }
        
//------------------------------------------------------------------------------------------
}