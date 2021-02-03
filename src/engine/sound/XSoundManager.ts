//------------------------------------------------------------------------------------------
import { XApp } from "../app/XApp";
import { Resource} from '../resource/Resource';
import { XTask } from '../task/XTask';
import { XType } from '../type/XType';
import { XProjectManager } from '../resource/XProjectManager';
import { Howl, Howler } from 'howler';
import { XPauseManager } from '../state/XPauseManager';

//------------------------------------------------------------------------------------------
export interface SoundHandle {
    name: string,
    sound: Howl;
    id: number;
    complete: any;
    end: any;
    loops: number;
    volume: number;
}

//------------------------------------------------------------------------------------------
export class XSoundManager {
    public m_XApp:XApp;

    public m_sounds:Map<number, SoundHandle>;

    public static g_GUID:number = 0;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_sounds = new Map<number, SoundHandle> ();

        XPauseManager.addPauseListener (() => {
            XType.forEach (this.m_sounds, 
                (__guid:number) => {
                    var __soundHandle:SoundHandle = this.m_sounds.get (__guid);
                    __soundHandle.sound.pause (__soundHandle.id);
                }
            );
        });

        XPauseManager.addResumeListener (() => {
            XType.forEach (this.m_sounds, 
                (__guid:number) => {
                    var __soundHandle:SoundHandle = this.m_sounds.get (__guid);
                    __soundHandle.sound.play (__soundHandle.id);
                }
            );
        });
    }

    //------------------------------------------------------------------------------------------	
    public playSoundFromName (
        __resourceName:string,
        __priority:number = 1.0,
        __loops:number = 0,
        __volume:number = 1.0,
        __mute:boolean = false,
        __successListener?:any,
        __completeListener?:any
        ):number {

        var __sound:Howl = this.m_XApp.getResourceByName (__resourceName);  
        var __id:number = __sound.play ();

        __sound.loop (__loops > 0, __id);
        __sound.volume (__volume, __id);
        __sound.mute (__mute, __id);

        var __guid:number = XSoundManager.g_GUID++;

        if (__successListener != null) {
            __successListener (__guid);
        }

        var __end:any;

        __sound.on ("end", __end = () => {
            var __soundHandle:SoundHandle = this.m_sounds.get (__guid);

            if (__soundHandle.loops > 0) {
                __sound.play (__soundHandle.id);
                __sound.loop (__soundHandle.loops > 0, __soundHandle.id);
                __sound.volume (__soundHandle.volume, __soundHandle.id)
            } else {
                this.removeSound (__guid);
            }
        });

        this.m_sounds.set (__guid,
            {
                name: __resourceName,
                sound: __sound,
                id: __id,
                complete: __completeListener,
                end: __end,
                loops: __loops,
                volume: __volume,
            }
        );
        
        return __guid;
    }

    //------------------------------------------------------------------------------------------
    public stopSound (__guid:number):void {
        this.removeSound (__guid);
    }
    
    //------------------------------------------------------------------------------------------
     public removeSound (__guid:number):void {
         if (this.m_sounds.has (__guid)) {
            var __soundHandle:SoundHandle = this.m_sounds.get (__guid);

            var __sound = __soundHandle.sound;
            var __id = __soundHandle.id;
            var __completeListener = __soundHandle.complete;
            var __end = __soundHandle.end;

            if (__completeListener != null) {
                __completeListener (__guid);
            }

             // console.log (": stop sound: ", __soundHandle.name, __soundHandle.id);

             __sound.off ("end", __end);

             __sound.stop (__id);

             this.m_sounds.delete (__guid);
         }
     }

     //------------------------------------------------------------------------------------------
     public removeAllSounds ():void {
        XType.forEach (this.m_sounds, 
            (__guid:number) => {
                this.removeSound (__guid);
            }
        );
     }

     //------------------------------------------------------------------------------------------
     public getSoundHandle (__guid:number):SoundHandle {
         if (this.m_sounds.has (__guid)) {
             return this.m_sounds.get (__guid);
         } else {
             return null;
         }
     }

//------------------------------------------------------------------------------------------	
}