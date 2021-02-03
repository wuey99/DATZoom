//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { TextInput } from 'pixi-textinput-v5';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';

//------------------------------------------------------------------------------------------
export class Box extends XGameObject {
    public m_width:number;
    public m_height:number;
    public m_justify:string;
    public m_fillColor:number;
    public m_spacing:number;
    public m_padding:number;
    public m_topPadding:number;
    public m_bottomPadding:number;
    public m_leftPadding:number;
    public m_rightPadding:number;
    public m_items:Array<PIXI.Sprite | TextInput>;
    public m_idToItem:Map<string, PIXI.Sprite | TextInput>;
    public m_fill:PIXI.Graphics;

//------------------------------------------------------------------------------------------
	public constructor () {
		super ();
	}

//------------------------------------------------------------------------------------------
    public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

        this.m_items = new Array<PIXI.Sprite | TextInput> ();
        this.m_idToItem = new Map<string, PIXI.Sprite | TextInput> ();
        
        return this;
    }

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);	

        this.m_width = __params[this.m_paramIndex++];
        this.m_height = __params[this.m_paramIndex++];
        this.m_justify = __params[this.m_paramIndex++];
        this.m_fillColor = __params[this.m_paramIndex++];

        this.m_spacing = 0;
        this.m_padding = 0;
        this.m_leftPadding = 0;
        this.m_rightPadding = 0;
        this.m_topPadding = 0;
        this.m_bottomPadding = 0;

        this.createFill ();

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public get width ():number {
        return this.m_width;
    }

//------------------------------------------------------------------------------------------
    public get height ():number {
        return this.m_height;
    }

//------------------------------------------------------------------------------------------
    public set spacing (__value:number) {
        this.m_spacing = __value;
    }
    
//------------------------------------------------------------------------------------------
    public createFill ():void {
        if (this.m_fillColor != -1) {
            this.m_fill = new PIXI.Graphics ();

            this.m_fill.beginFill (this.m_fillColor);
            this.m_fill.drawRect (0, 0, this.m_width, this.m_height);
            this.m_fill.endFill ();

            this.addSortableChild (this.m_fill, this.getLayer (), this.getDepth () - 1, true);
        }
    }

//------------------------------------------------------------------------------------------
    public getItems ():Array<PIXI.Sprite | TextInput> {
        return this.m_items;
    }

//------------------------------------------------------------------------------------------
    public addItem (__item:PIXI.Sprite | TextInput, __id:string = ""):void {
        this.m_items.push (__item);
        this.m_idToItem.set (__id, __item);

        this.reorder ();
    }

    //------------------------------------------------------------------------------------------
    public getIndexByItem (__item:PIXI.Sprite | TextInput):number {
        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            if (__item == this.m_items[i]) {
                return i;
            }
        }

        return -1;
    }

//------------------------------------------------------------------------------------------
    public getItemById (__id:string = ""):PIXI.Sprite | TextInput {
        return this.m_idToItem.get (__id);
    }

//------------------------------------------------------------------------------------------
    public removeItem (__item:PIXI.Sprite | TextInput):void {
        var __index:number = this.m_items.indexOf (__item);

        if (__index >= 0) {
            if (this.m_childSprites.has (__item)) {
                this.removeChildSprite (__item);
            }

            if (this.m_childObjects.has (__item as XGameObject)) {
                this.removeChildObject (__item as XGameObject);
            }

            this.m_items.splice (__index, 1);

            XType.forEach (this.m_idToItem,
                (__id:string) => {
                    if (this.m_idToItem.get (__id) == __item) {
                        this.m_idToItem.delete (__id);
                    }
                }
            );
        }
    }

//------------------------------------------------------------------------------------------
    public removeAllItems ():void {
        var __itemsToDelete:Array<PIXI.Sprite | TextInput> = new Array<PIXI.Sprite | TextInput> ();

        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            __itemsToDelete.push (this.m_items[i]);
        }

        for (i = 0; i < __itemsToDelete.length; i++) {
           this.removeItem (__itemsToDelete[i]);
        }
    }

//------------------------------------------------------------------------------------------
    public reorder ():void {
    }

	//------------------------------------------------------------------------------------------
	public getBoxLayer (__xml:XSimpleXMLNode):number {
		var __layer:number;

		if (__xml.hasAttribute ("layer")) {
			__layer = __xml.getAttributeInt ("layer");
		} else {
			__layer = this.getLayer ();
		}

		return __layer;
	}

	//------------------------------------------------------------------------------------------
	public getBoxDepth (__xml:XSimpleXMLNode):number {
		var __depth:number;

		if (__xml.hasAttribute ("depth")) {
			__depth = __xml.getAttributeFloat ("depth");
		} else {
			__depth = this.getDepth ();
		}

		if (__xml.hasAttribute ("depth+")) {
			__depth += __xml.getAttributeFloat ("depth+");
		}

		return __depth;
    }
    
//------------------------------------------------------------------------------------------
    public getActualWidth ():number {
        return this.m_width - this.m_leftPadding - this.m_rightPadding;
    }

//------------------------------------------------------------------------------------------
    public getActualHeight ():number {
        return this.m_height - this.m_topPadding - this.m_bottomPadding;
    }

//------------------------------------------------------------------------------------------	
}
	
