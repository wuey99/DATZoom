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
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { TextInput } from 'pixi-textinput-v5';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { FlockLeader } from '../test/FlockLeader';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';

//------------------------------------------------------------------------------------------
export class UserList extends VBox {

//------------------------------------------------------------------------------------------
	public constructor () {
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
 
        var __userList:Array<SFS2X.SFSUser> = __params[this.m_paramIndex++];
        var __fontName:string = __params[this.m_paramIndex++];
        var __fontSize:number = __params[this.m_paramIndex++];
        var __textColor:number = __params[this.m_paramIndex++];
        var __horzAlign:string = __params[this.m_paramIndex++];
        var __xpos:number = __params[this.m_paramIndex++];
        this.spacing = __params[this.m_paramIndex++];

		var __user:SFS2X.SFSuser;

        for (__user of __userList) {
			if (!__user.name.startsWith ("moderator:")) {
				var __userLabel:XTextSprite = this.createXTextSprite (
					-1,
					-1,
					__user.name,
				    __fontName,
					__fontSize,
					__textColor,
					true,
					"left", "center"
				);

				this.addItem (__userLabel);
				this.addSortableChild (__userLabel, this.getLayer (), this.getDepth (), false);
				this.horizontalPercent (__userLabel, __xpos);
			}
        }
        
        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public updateList (__params:Array<any> = null):XGameObject {
        this.removeAllItems ();
        
        this.m_paramIndex = 0;

        return this.afterSetup (__params);
    }

//------------------------------------------------------------------------------------------	
}
	
