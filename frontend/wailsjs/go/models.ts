export namespace main {
	
	export class DeviceTemplate {
	    name: string;
	    filename: string;
	    iconCode: string;
	    landscape?: boolean;
	    categories: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeviceTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.filename = source["filename"];
	        this.iconCode = source["iconCode"];
	        this.landscape = source["landscape"];
	        this.categories = source["categories"];
	    }
	}
	export class SSHKey {
	    name: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new SSHKey(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	    }
	}
	export class SelectedFile {
	    name: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new SelectedFile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	    }
	}
	export class SyncTemplate {
	    name: string;
	    filename: string;
	    localPath: string;
	
	    static createFrom(source: any = {}) {
	        return new SyncTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.filename = source["filename"];
	        this.localPath = source["localPath"];
	    }
	}

}

