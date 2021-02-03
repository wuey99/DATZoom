//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { EnemyX } from './EnemyX';

//------------------------------------------------------------------------------------------
export class OctopusBug extends EnemyX {
    public m_sprite:PIXI.AnimatedSprite;

    public script:XTask;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

        this.createSprites ();

        this.script = this.addEmptyTask ();

        this.Idle_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite ("OctopusBug");
        this.addSortableChild (this.m_sprite, 0, 0.0, false);

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
                () => { this.m_sprite.gotoAndStop (0); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (1); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (2); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (3); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (4); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (5); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (6); }, XTask.WAIT, 0x0200,
                () => { this.m_sprite.gotoAndStop (7); }, XTask.WAIT, 0x0200,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }
        
//------------------------------------------------------------------------------------------
}