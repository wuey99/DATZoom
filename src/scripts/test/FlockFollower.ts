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
import { G } from '../../engine/app/G';
import { GUID } from '../../engine/utils/GUID';
import { XNumber } from '../../engine/task/XNumber';

	//------------------------------------------------------------------------------------------
	export class FlockFollower extends EnemyX {
		public m_leaderObject:XGameObject;
        
        public m_life:number;
		public m_flash:number;
		
		public m_triggerID:number;
		
		public x_life:number;
		
		public m_flockID:String;
		
		//------------------------------------------------------------------------------------------
		constructor () {
			super ();
		}
		
		//------------------------------------------------------------------------------------------
        public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
            super.setup (__world, __layer, __depth);
			
            this.createSprites ();
            
            return this;
		}
		
        //------------------------------------------------------------------------------------------
        public afterSetup (__params:Array<any> = null):XGameObject {
            super.afterSetup (__params);
            
			this.m_leaderObject = __params[0];
			this.x_life = __params[1];
            this.m_flockID = __params[2];
            
			// setCX ( -20, 20, -20, 20);
			
			this.gravity = this.addEmptyTask ();
			this.script = this.addEmptyTask ();
			
			this.gravity.gotoTask (this.getPhysicsTaskX (0.25));
			
			this.createObjects ();
			
			this.m_life = this.x_life;
            this.m_flash = 0;
            
			this.steerToTarget ();
            
            this.Idle_Script ();
            
            this.m_triggerID = G.appX.addTriggerXListener (this.onTriggerSignal);
            
            return this;
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup ():void {
			 super.cleanup();
			 
			 G.appX.removeTriggerXListener (this.m_triggerID);
		}
		
		//------------------------------------------------------------------------------------------
		public onTriggerSignal (__trigger:string):void {
			if (__trigger == this.m_flockID) {
				this.nukeLater ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
            this.m_sprite = this.createAnimatedSprite ("OctopusBug");
            this.addSortableChild (this.m_sprite, 0, 0.0, false);
    
            this.show ();
		}

		//------------------------------------------------------------------------------------------
		public createObjects ():void {
		}

		//------------------------------------------------------------------------------------------
		public getName ():string {
			return "OctopusBug";
		}
        
    	//------------------------------------------------------------------------------------------
		public getPhysicsTaskX (DECCEL:number):Array<any> {
			return [
				XTask.LABEL, "loop",
                    XTask.WAIT, 0x0100,
                    
                    () => this.updatePhysics (),
                    	
					XTask.GOTO, "loop",
				
				XTask.RETN,
			];
        }
        
		//------------------------------------------------------------------------------------------
		public updatePhysics ():void {			
			// super.updatePhysics ();
            
            /*
			checkDeathFromMickeyLaser (
				() => {
					Hit_Script ();
				}, 
				
				() => {
					G.appX.createSmokeCloudExplosion (self);

					G.appX.dropCoins (oX, oY, 1);
				}
            );
            */
		}

		//------------------------------------------------------------------------------------------
		public steerToTarget ():void {
			this.m_autoRotation = true;
			this.m_rotationTicks = 0x0000;
			
			var __ticks:XNumber = new XNumber (0);			
			var __delay:XNumber = new XNumber (0);
								
			var __targetSpeed:number = this.m_speed = Math.random () * 8.0 + 4.0;
			
			var __setParams = function __setParams ():void {
				__ticks.value = (Math.floor (Math.random () * 8) + 32) * 256;
				__delay.value = (Math.floor (Math.random () * 8) + 32) * 256;
				__targetSpeed = Math.random () * 8.0 + 4.0;
			}.bind (this);
			
            __setParams ();
            
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					() => {
						if (this.m_speed < __targetSpeed) {
							this.m_speed = Math.min (__targetSpeed, this.m_speed + 0.15);
						} else {
							this.m_speed = Math.max (__targetSpeed, this.m_speed - 0.15);
						}
					},
					
					XTask.GOTO, "loop",
				XTask.RETN,
			]);
			
			this.addTask ([
				XTask.LABEL, "loop",
					() => {
                        __setParams ();
					}, XTask.WAIT, 0x2000,
					
					XTask.GOTO, "loop",	
				XTask.RETN,
			]);
            
			this.addTask ([
				XTask.LABEL, "loop",
					() => {				
						var __targetRotation:number = this.getAngleToTarget (this.m_leaderObject.x, this.m_leaderObject.y);
						
						var __delta:number = this.getDelta (this.angle, __targetRotation) / this.ticksToSeconds (__ticks.value);
						
						this.m_targetRotation = __targetRotation;
						this.m_rotationSpeed = __delta;
						this.m_rotationTicks = __ticks.value;	
						
						this.m_autoSpeed = true;
                        this.m_autoRotation = true;
					}, XTask.WAIT, __delay,
					
					XTask.GOTO, "loop",
					
				XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		public Idle_Script ():void {
			// m_hitResponseTimer = 0;
			
			this.m_flash = 0;
			
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
						
							() => {
							},
						
						XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",
					XTask.EXEC, this.idleAnimationX (),
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public Hit_Script ():void {
			// m_hitResponseTimer = 8;
			
			this.addTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",
					XTask.LOOP, 10,
						() => { this.m_flash = 8; }, XTask.WAIT, 0x0200,
						() => { this.m_flash = 0; }, XTask.WAIT, 0x0200,
					XTask.NEXT,
					
				XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
			]);
			
		//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public idleAnimationX ():Array<any> {
			return [
				() => { this.m_sprite.gotoAndStop (0 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (1 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (2 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (3 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (4 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (5 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (6 + this.m_flash); }, XTask.WAIT, 0x0200,
				() => { this.m_sprite.gotoAndStop (7 + this.m_flash); }, XTask.WAIT, 0x0200,
				
				XTask.RETN,
			];
		}
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }