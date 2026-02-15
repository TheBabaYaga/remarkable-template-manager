export namespace main {
	
	export class BackupResult {
	    filePath: string;
	    sizeBytes: number;
	
	    static createFrom(source: any = {}) {
	        return new BackupResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filePath = source["filePath"];
	        this.sizeBytes = source["sizeBytes"];
	    }
	}
	export class DeviceConfig {
	    ip: string;
	    sshKeyPath: string;
	
	    static createFrom(source: any = {}) {
	        return new DeviceConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.sshKeyPath = source["sshKeyPath"];
	    }
	}
	export class Config {
	    version: string;
	    device: DeviceConfig;
	    lastBackupDir?: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.device = this.convertValues(source["device"], DeviceConfig);
	        this.lastBackupDir = source["lastBackupDir"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
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

