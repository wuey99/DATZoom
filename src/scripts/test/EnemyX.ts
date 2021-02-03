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
import { XPoint } from '../../engine/geom/XPoint';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class EnemyX extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;

    public script:XTask;
    public gravity:XTask;

    public m_targetX:number;
    public m_targetY:number;
    public m_speed:number;
    public m_accel:number;
    public m_targetSpeed:number;
    public m_autoSpeed:boolean;
    
    public m_targetObject:XGameObject;
    public m_currentTicks0:number;
    public m_totalTicks0:number;
    
    public m_targetRotation:number;
    public m_rotationTicks:number;
    public m_rotationSpeed:number;
    public m_autoRotation:boolean;

    public m_startPos:XPoint; // -> ctrlPos	
    public m_startDelta:XPoint;
    public m_ctrlPos:XPoint; // -> targetPos
    public m_ctrlDelta:XPoint;
    public m_targetPos:XPoint;
    public m_currentTicks:number;
    public m_totalTicks:number;

    public oDX:number;
    public oDY:number;

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

        this.m_targetX = 0;
        this.m_targetY = 0;
        this.m_speed = 0;
        this.m_accel = 0;
        this.m_targetRotation = 180;
        this.m_rotationTicks = 0x0000;
        this.m_rotationSpeed = 0;
        this.m_autoSpeed = false;
        this.m_autoRotation = false;
        this.m_targetObject = null;
        
        this.m_startPos = this.world.getXPointPoolManager ().borrowObject ();
        this.m_startDelta = this.world.getXPointPoolManager ().borrowObject ();	
        this.m_ctrlPos = this.world.getXPointPoolManager ().borrowObject ();
        this.m_ctrlDelta = this.world.getXPointPoolManager ().borrowObject ();
        this.m_targetPos = this.world.getXPointPoolManager ().borrowObject ()

        this.oDX = this.oDY = 0;

        this.addTask ([				
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                
                () => {
                    if (this.m_autoRotation) {
                        this.applyRotation ();
                    }
                    
                    if (this.m_autoSpeed) {
                        this.applySpeed ();
                    }
                    
                    this.applyAcceleration ();
                    
                    this.interpolateSplinePosition ();
                    
                    this.moveToObjectHandler ();

                    this.x += this.oDX;
                    this.y += this.oDY;
                },
                
                XTask.GOTO, "loop",
                
            XTask.RETN,
        ]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();

        this.world.getXPointPoolManager ().returnObject (this.m_startPos);
        this.world.getXPointPoolManager ().returnObject (this.m_startDelta);
        this.world.getXPointPoolManager ().returnObject (this.m_ctrlPos);
        this.world.getXPointPoolManager ().returnObject (this.m_ctrlDelta);
        this.world.getXPointPoolManager ().returnObject (this.m_targetPos);
	}
    

    //------------------------------------------------------------------------------------------
    public getScreenX (__percentage:number):number {
        return G.SCREEN_WIDTH * __percentage;
    }

    //------------------------------------------------------------------------------------------
    public getScreenY (__percentage:number):number {
        return G.SCREEN_HEIGHT * __percentage;
    }

    //------------------------------------------------------------------------------------------
    public moveTo (__startX:number, __startY:number, __targetX:number, __targetY:number, __ticks:number):void {
        this.m_targetX = __targetX;
        this.m_targetY = __targetY;
        
        this.oDX = (__targetX - __startX) / this.ticksToSeconds (__ticks);
        this.oDY = (__targetY - __startY) / this.ticksToSeconds (__ticks);
                
        this.m_autoSpeed = false;			
    }

    //------------------------------------------------------------------------------------------
    public moveToObject (__startX:number, __startY:number, __logicObject:XGameObject, __ticks:number):void {
        this.m_targetObject = __logicObject;
        
        var __time:number = this.ticksToSeconds (__ticks);
        
        this.oDX = (this.m_targetObject.x - __startX) / __time;
        this.oDY = (this.m_targetObject.y - __startY) / __time;
        
        this.m_currentTicks0 = 0;
        this.m_totalTicks0 = __ticks;
        
        this.m_autoSpeed = false;
    }

    //------------------------------------------------------------------------------------------
    public moveToObjectHandler ():void {
        if (this.m_targetObject != null) {
            this.m_currentTicks0 = Math.min (this.m_totalTicks0, this.m_currentTicks0 + 0x0100);
        
            var __time:number = this.ticksToSeconds (this.m_totalTicks0 - this.m_currentTicks0);
            
            if (__time > 0) {
                this.oDX = (this.m_targetObject.x - this.x) / __time;
                this.oDY = (this.m_targetObject.y - this.y) / __time;
            }
            
            if (this.m_currentTicks0 >= this.m_totalTicks0) {
                this.x = this.m_targetObject.x;
                this.y = this.m_targetObject.y;
                
                this.m_targetObject = null;
            }
        }
    }

    //------------------------------------------------------------------------------------------
    public applyRotation ():void {
        if (this.m_rotationTicks < 0x0080) {
            this.angle = this.m_targetRotation;
        
            return;
        }
        
        this.m_rotationTicks -= 0x0100;

        this.angle = (this.angle + this.m_rotationSpeed) % 360;
    }

    //------------------------------------------------------------------------------------------
    public applySpeed ():void {
        var __angle:number = ((this.angle - 90.0) % 360);
        var __radians:number = __angle * (Math.PI / 180);
        
        this.oDX = Math.cos (__radians) * this.m_speed;
        this.oDY = Math.sin (__radians) * this.m_speed;			
    }

    //------------------------------------------------------------------------------------------
    public applyAcceleration ():void {
        if (this.m_accel > 0) {
            this.m_speed += this.m_accel;
            
            if (this.m_speed >= this.m_targetSpeed) {
                this.m_speed = this.m_targetSpeed;
            }
        } else {
            this.m_speed += this.m_accel;
            
            if (this.m_speed <= this.m_targetSpeed) {
                this.m_speed = this.m_targetSpeed;
            }
        }
    }

    //------------------------------------------------------------------------------------------
    public startSplineMovement (
        __startX:number, __startY:number,
        __targetX:number, __targetY:number,
        __ctrlX:number, __ctrlY:number,
        __ticks:number
        ):void {
        
        console.log (": startSplineMovement: ");
        
        this.m_startPos.x = __startX;
        this.m_startPos.y = __startY;
        
        this.m_targetPos.x = __targetX;
        this.m_targetPos.y = __targetY;
        
        this.m_ctrlPos.x = __ctrlX;
        this.m_ctrlPos.y = __ctrlY;
        
        this.m_currentTicks = 0;
        this.m_totalTicks = __ticks;
        
        this.calculateDelta (this.m_ctrlPos, this.m_startPos, this.m_startDelta, __ticks);
        this.calculateDelta (this.m_targetPos, this.m_ctrlPos, this.m_ctrlDelta, __ticks);
    }
        
    //------------------------------------------------------------------------------------------
    public stopSplineMovement ():void {
        this.m_currentTicks = 0;
        this.m_totalTicks = 0;			
    }

    //------------------------------------------------------------------------------------------
    public calculateDelta (__target:XPoint, __start:XPoint, __delta:XPoint, __ticks:number):void {
        __delta.x = (__target.x - __start.x) / this.ticksToSeconds (__ticks);
        __delta.y = (__target.y - __start.y) / this.ticksToSeconds (__ticks);
    }

    //------------------------------------------------------------------------------------------
    public ticksToSeconds (__ticks:number):number {
        var __seconds:number = __ticks / 256;
        var __frac:number = (Math.floor (__ticks) & 255) / 256;
        
        return __seconds + __frac;
    }

    //------------------------------------------------------------------------------------------
    // move startPos to ctrlPos
    // move ctrlPos to targetPos
    //------------------------------------------------------------------------------------------
    public interpolateSplinePosition ():void {
        if (this.m_currentTicks == this.m_totalTicks) {
            return;
        }
        
        this.m_startPos.x += this.m_startDelta.x;
        this.m_startPos.y += this.m_startDelta.y;
        
        this.m_ctrlPos.x += this.m_ctrlDelta.x;
        this.m_ctrlPos.y += this.m_ctrlDelta.y;	
        
        this.m_currentTicks = Math.min (this.m_totalTicks, this.m_currentTicks + 0x0100);
        
        var __time:number =  this.ticksToSeconds (this.m_currentTicks) / this.ticksToSeconds (this.m_totalTicks);
        
        var __deltaX:number = (this.m_ctrlPos.x - this.m_startPos.x) * __time;
        var __deltaY:number = (this.m_ctrlPos.y - this.m_startPos.y) * __time;
        
        this.x = this.m_startPos.x + __deltaX;
        this.y = this.m_startPos.y + __deltaY;
    }

    //------------------------------------------------------------------------------------------	
    public getAngleToTarget (__targetX:number, __targetY:number):number {
        var __dx:number = __targetX - this.x;
        var __dy:number = __targetY - this.y;
        
        var __radians:number = Math.atan2 (__dy, __dx);
        
        var __angle:number = -__radians*180/Math.PI;					
        __angle = __angle > 0 ? __angle : __angle + 360;
        
        __angle = 360 - __angle + 90;  if (__angle >= 360) __angle -= 360;
        
        return __angle % 360;
    }

    //------------------------------------------------------------------------------------------
    public getDelta (__currentRotation:number, __targetRotation:number):number {
        var __delta1:number = Math.floor (__targetRotation - __currentRotation) % 360;
        
        if (__delta1 < -180) {
            __delta1 += 360;
        }
            
        var __delta2:number = -Math.floor ((__currentRotation + 360) - __targetRotation) % 360;

        if (__delta2 < -180) {
            __delta2 += 360;
        }
            
        var __delta:number;
        
        if (Math.abs (__delta1) < Math.abs (__delta2)) {
            __delta = __delta1;
        } else {
            __delta = __delta2;
        }
        
        return __delta;
    }

//------------------------------------------------------------------------------------------
}