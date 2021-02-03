//------------------------------------------------------------------------------------------
    import { XType } from '../type/XType';
    import * as Parser from 'fast-xml-parser';
    import { XSimpleXMLNode } from './XSimpleXMLNode';
    
//------------------------------------------------------------------------------------------
	export class XSimpleXMLDocument extends XSimpleXMLNode {
		
//------------------------------------------------------------------------------------------
		constructor () {
			super ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
            super.cleanup ();
		}
		
//------------------------------------------------------------------------------------------
		public toXMLString (__indent:number = 0):string {
			var __xmlString:string = "<?xml version='1.0' encoding='UTF-8'?>\n";
			
			__xmlString += this.__tab (__indent) + super.toXMLString (__indent);
			
			return __xmlString;	
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }