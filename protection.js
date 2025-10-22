// نظام الحماية الأساسي مع التتبع المتقدم
const securitySystem = {
    // إعدادات النظام
    config: {
        redirectUrl: 'F.html',
        alertDuration: 3000,
        enableTracking: true,
        enableAdvancedTracking: true,
        enableBehaviorTracking: true,
        enableFingerprinting: true
    },

    // عناصر DOM
    elements: {
        securityAlert: null
    },

    // بيانات التتبع
    trackingData: {
        behavior: {
            mouseMovements: [],
            clicks: [],
            scrolls: [],
            keystrokes: [],
            focusChanges: [],
            timeOnPage: 0
        },
        sessionStart: null
    },

    // Firebase
    firebase: {
        app: null,
        database: null,
        initialized: false
    },

    // تهيئة النظام
    init() {
        this.trackingData.sessionStart = Date.now();
        this.createAlertElement();
        this.initFirebase();
        this.setupProtection();
        this.setupAdvancedTracking();
        console.log('🔒 نظام الحماية مفعل مع التتبع المتقدم');
    },

    // إنشاء عنصر التنبيه
    createAlertElement() {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'securityAlert';
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(150%);
            transition: transform 0.4s ease;
            z-index: 10000;
            font-weight: bold;
            font-size: 14px;
        `;
        document.body.appendChild(alertDiv);
        this.elements.securityAlert = alertDiv;
    },

    // تهيئة Firebase
    initFirebase() {
        try {
            // إعدادات Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyAd5KNh5H6KaQ9nv8FP3keyFRh28zSwfLM",
                authDomain: "gama-xiter.firebaseapp.com",
                databaseURL: "https://gama-xiter-default-rtdb.firebaseio.com",
                projectId: "gama-xiter",
                storageBucket: "gama-xiter.firebasestorage.app",
                messagingSenderId: "979348178199",
                appId: "1:979348178199:web:dd66b3d0d00b76fe61a352",
                measurementId: "G-4Q4P3GTJN5"
            };

            // محاولة استخدام التطبيق الموجود أو إنشاء جديد
            try {
                this.firebase.app = firebase.app();
                console.log('✅ استخدام تطبيق Firebase موجود');
            } catch (error) {
                this.firebase.app = firebase.initializeApp(firebaseConfig);
                console.log('✅ إنشاء تطبيق Firebase جديد');
            }

            this.firebase.database = firebase.database();
            this.firebase.initialized = true;
            console.log('✅ Firebase جاهز للإرسال');

        } catch (error) {
            console.error('❌ فشل تهيئة Firebase:', error);
            this.firebase.initialized = false;
        }
    },

    // عرض التنبيه
    showAlert(actionType) {
        if (this.elements.securityAlert) {
            this.elements.securityAlert.textContent = `🚨 ${actionType}`;
            this.elements.securityAlert.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                this.elements.securityAlert.style.transform = 'translateX(150%)';
            }, this.config.alertDuration);
        }

        // جمع بيانات المستخدم إذا كان التتبع مفعل
        if (this.config.enableTracking) {
            this.collectAndSendData(actionType);
        }
    },

    // إعداد التتبع المتقدم
    setupAdvancedTracking() {
        if (!this.config.enableAdvancedTracking) return;

        // تتبع حركة الماوس
        document.addEventListener('mousemove', (e) => {
            if (this.trackingData.behavior.mouseMovements.length < 1000) {
                this.trackingData.behavior.mouseMovements.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now() - this.trackingData.sessionStart,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // تتبع النقرات
        document.addEventListener('click', (e) => {
            this.trackingData.behavior.clicks.push({
                x: e.clientX,
                y: e.clientY,
                target: e.target.tagName,
                time: Date.now() - this.trackingData.sessionStart,
                timestamp: new Date().toISOString()
            });
        });

        // تتبع التمرير
        let scrollTimeout;
        document.addEventListener('scroll', (e) => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackingData.behavior.scrolls.push({
                    position: window.pageYOffset,
                    max: Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    ),
                    time: Date.now() - this.trackingData.sessionStart,
                    timestamp: new Date().toISOString()
                });
            }, 100);
        });

        // تتبع الكتابة (بحذر)
        document.addEventListener('keydown', (e) => {
            if (this.trackingData.behavior.keystrokes.length < 500) {
                if (e.target.type === 'password') return;
                
                this.trackingData.behavior.keystrokes.push({
                    key: e.key,
                    code: e.code,
                    target: e.target.tagName,
                    time: Date.now() - this.trackingData.sessionStart,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // تتبع تغيير التركيز
        document.addEventListener('focusin', (e) => {
            this.trackingData.behavior.focusChanges.push({
                target: e.target.tagName,
                time: Date.now() - this.trackingData.sessionStart,
                timestamp: new Date().toISOString()
            });
        });

        // تحديث وقت البقاء في الصفحة
        setInterval(() => {
            this.trackingData.behavior.timeOnPage = Date.now() - this.trackingData.sessionStart;
        }, 1000);
    },

    // جمع وإرسال البيانات
    async collectAndSendData(actionType) {
        try {
            const userData = await this.collectUserData(actionType);
            this.sendToServer(userData);
        } catch (error) {
            console.error('Error collecting data:', error);
        }
    },

    // جمع بيانات المستخدم المتقدمة
    async collectUserData(actionType) {
        const basicInfo = {
            timestamp: new Date().toISOString(),
            actionType: actionType,
            pageUrl: window.location.href,
            referrer: document.referrer,
            pageTitle: document.title,
            sessionDuration: this.trackingData.behavior.timeOnPage
        };

        // 1. معلومات الشبكة والموقع
        const networkInfo = await this.getNetworkInfo();
        Object.assign(basicInfo, networkInfo);

        // 2. معلومات المتصفح والجهاز
        const deviceInfo = this.getDeviceInfo();
        Object.assign(basicInfo, deviceInfo);

        // 3. معلومات النظام
        const systemInfo = this.getSystemInfo();
        Object.assign(basicInfo, systemInfo);

        // 4. البصمة الرقمية
        if (this.config.enableFingerprinting) {
            const fingerprint = this.generateFingerprint();
            basicInfo.fingerprint = fingerprint;
        }

        // 5. البيانات السلوكية (مختصرة)
        if (this.config.enableBehaviorTracking) {
            basicInfo.behaviorSummary = this.getBehaviorSummary();
        }

        return basicInfo;
    },

    // الحصول على معلومات الشبكة
    async getNetworkInfo() {
        const networkInfo = {};
        
        try {
            // الحصول على IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            networkInfo.ip = ipData.ip;

            // الحصول على معلومات الموقع
            try {
                const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
                const locationData = await locationResponse.json();
                networkInfo.location = {
                    country: locationData.country_name,
                    city: locationData.city,
                    region: locationData.region,
                    timezone: locationData.timezone,
                    org: locationData.org
                };
            } catch (e) {
                networkInfo.location = { error: "لا يمكن الحصول على الموقع" };
            }

        } catch (e) {
            networkInfo.ip = 'غير متوفر';
            networkInfo.location = { error: "لا يمكن الحصول على الموقع" };
        }

        return networkInfo;
    },

    // الحصول على معلومات الجهاز
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            vendor: navigator.vendor,
            deviceType: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            os: this.getOSInfo(),
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            hardware: {
                cores: navigator.hardwareConcurrency,
                memory: navigator.deviceMemory,
                touchSupport: 'ontouchstart' in window
            }
        };
    },

    // الحصول على معلومات النظام
    getSystemInfo() {
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            cookies: navigator.cookieEnabled,
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            java: navigator.javaEnabled ? navigator.javaEnabled() : false,
            pdf: navigator.pdfViewerEnabled || false,
            doNotTrack: navigator.doNotTrack,
            online: navigator.onLine
        };
    },

    // توليد بصمة المتصفح
    generateFingerprint() {
        const components = [];

        // 1. معلومات المتصفح الأساسية
        components.push(navigator.userAgent);
        components.push(navigator.language);
        components.push(navigator.platform);

        // 2. معلومات الشاشة
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth);
        components.push(screen.pixelDepth);

        // 3. المنطقة الزمنية
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
        components.push(new Date().getTimezoneOffset());

        // 4. إمكانيات المتصفح
        components.push(!!window.localStorage);
        components.push(!!window.sessionStorage);
        components.push(!!window.indexedDB);
        components.push(navigator.hardwareConcurrency);
        components.push(navigator.deviceMemory);

        // 5. Canvas Fingerprinting (بسيط)
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Fingerprint', 2, 15);
            
            const canvasData = canvas.toDataURL();
            components.push(canvasData.substring(0, 100));
        } catch (e) {
            components.push('canvas_error');
        }

        // 6. WebGL (بسيط)
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            }
        } catch (e) {
            components.push('webgl_error');
        }

        return btoa(components.join('|')).substring(0, 50);
    },

    // ملخص البيانات السلوكية
    getBehaviorSummary() {
        const behavior = this.trackingData.behavior;
        return {
            totalMouseMovements: behavior.mouseMovements.length,
            totalClicks: behavior.clicks.length,
            totalScrolls: behavior.scrolls.length,
            totalKeystrokes: behavior.keystrokes.length,
            totalFocusChanges: behavior.focusChanges.length,
            timeOnPage: behavior.timeOnPage,
            averageMouseSpeed: this.calculateAverageMouseSpeed(),
            clickHeatmap: this.generateClickHeatmap(),
            scrollDepth: this.calculateScrollDepth()
        };
    },

    // حساب سرعة الماوس المتوسطة
    calculateAverageMouseSpeed() {
        const movements = this.trackingData.behavior.mouseMovements;
        if (movements.length < 2) return 0;

        let totalDistance = 0;
        for (let i = 1; i < movements.length; i++) {
            const dx = movements[i].x - movements[i-1].x;
            const dy = movements[i].y - movements[i-1].y;
            totalDistance += Math.sqrt(dx*dx + dy*dy);
        }

        return totalDistance / movements.length;
    },

    // توليد خريطة النقرات
    generateClickHeatmap() {
        const clicks = this.trackingData.behavior.clicks;
        const zones = {
            topLeft: 0, topRight: 0,
            bottomLeft: 0, bottomRight: 0,
            center: 0
        };

        clicks.forEach(click => {
            const x = click.x / window.innerWidth;
            const y = click.y / window.innerHeight;

            if (x < 0.4 && y < 0.4) zones.topLeft++;
            else if (x >= 0.6 && y < 0.4) zones.topRight++;
            else if (x < 0.4 && y >= 0.6) zones.bottomLeft++;
            else if (x >= 0.6 && y >= 0.6) zones.bottomRight++;
            else zones.center++;
        });

        return zones;
    },

    // حساب عمق التمرير
    calculateScrollDepth() {
        const scrolls = this.trackingData.behavior.scrolls;
        if (scrolls.length === 0) return 0;

        const lastScroll = scrolls[scrolls.length - 1];
        const maxScroll = lastScroll.max;
        const currentScroll = lastScroll.position;

        return maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
    },

    // تحديد نوع الجهاز
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
        return "desktop";
    },

    // تحديد المتصفح
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        let version = "Unknown";

        if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Opera")) browser = "Opera";

        const versionMatch = ua.match(/(Chrome|Firefox|Safari|Edg|Opera)\/([\d.]+)/);
        if (versionMatch) version = versionMatch[2];

        return { name: browser, version: version };
    },

    // تحديد نظام التشغيل
    getOSInfo() {
        const ua = navigator.userAgent;
        let os = "Unknown";
        let version = "Unknown";

        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

        const versionMatch = ua.match(/(Windows NT|Android|iPhone OS|Mac OS X|Linux)\s*([\d._]+)/);
        if (versionMatch) version = versionMatch[2];

        return { name: os, version: version };
    },

    // إرسال البيانات إلى Firebase
    sendToServer(userData) {
        // إذا كان Firebase غير مهيء، حاول تهيئته أولاً
        if (!this.firebase.initialized) {
            console.log('🔄 محاولة إعادة تهيئة Firebase...');
            this.initFirebase();
            
            if (!this.firebase.initialized) {
                console.log('❌ Firebase غير متاح - حفظ محلي');
                this.saveLocalBackup(userData);
                return;
            }
        }

        try {
            // إرسال البيانات إلى Firebase
            const alertRef = this.firebase.database.ref('security_alerts/' + Date.now());
            alertRef.set({
                ...userData,
                receivedAt: new Date().toISOString(),
                id: Date.now().toString(),
                status: 'new'
            })
            .then(() => {
                console.log('✅ تم إرسال البيانات إلى Firebase بنجاح');
            })
            .catch((error) => {
                console.log('❌ خطأ في إرسال Firebase:', error.message);
                this.saveLocalBackup(userData);
            });
            
        } catch (error) {
            console.log('💾 حفظ البيانات محلياً:', error.message);
            this.saveLocalBackup(userData);
        }
    },

    // حفظ نسخة احتياطية محلية
    saveLocalBackup(userData) {
        try {
            const backups = JSON.parse(localStorage.getItem('security_backups') || '[]');
            const backupItem = {
                ...userData,
                backupTimestamp: new Date().toISOString(),
                backupId: 'local_' + Date.now()
            };
            
            backups.push(backupItem);
            
            // احفظ فقط آخر 100 تنبيه
            if (backups.length > 100) {
                backups.splice(0, backups.length - 100);
            }
            
            localStorage.setItem('security_backups', JSON.stringify(backups));
            console.log('💾 تم حفظ البيانات محلياً. العدد:', backups.length);
            
            // محاولة إعادة الإرسال لاحقاً
            this.retryFailedSends();
            
        } catch (e) {
            console.log('❌ خطأ في الحفظ المحلي');
        }
    },

    // إعادة محاولة إرسال البيانات الفاشلة
    retryFailedSends() {
        try {
            const backups = JSON.parse(localStorage.getItem('security_backups') || '[]');
            if (backups.length > 0 && this.firebase.initialized) {
                console.log(`🔄 محاولة إعادة إرسال ${backups.length} تنبيه فاشل`);
                
                // أرسل آخر 5 تنبيهات فاشلة فقط
                const toRetry = backups.slice(-5);
                
                toRetry.forEach((backup, index) => {
                    setTimeout(() => {
                        this.sendToServer(backup);
                    }, index * 1000); // تأخير 1 ثانية بين كل محاولة
                });
            }
        } catch (e) {
            console.log('❌ خطأ في إعادة الإرسال');
        }
    },

    // التوجيه للصفحة الأخرى
    redirect() {
        setTimeout(() => {
            window.location.href = this.config.redirectUrl;
        }, 1500);
    },

    // إعداد الحماية
    setupProtection() {
        // منع النقر الأيمن
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showAlert('النقر الأيمن - قائمة السياق');
            this.redirect();
        });

        // منع اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const blockedKeys = {
                'F12': 'F12 - أدوات المطورين',
                'PrintScreen': 'PrintScreen - لقطة الشاشة'
            };

            const blockedCombinations = [
                { ctrl: true, key: 'u', message: 'Ctrl+U - عرض المصدر' },
                { ctrl: true, key: 'U', message: 'Ctrl+U - عرض المصدر' },
                { ctrl: true, shift: true, key: 'i', message: 'Ctrl+Shift+I - أدوات المطورين' },
                { ctrl: true, shift: true, key: 'I', message: 'Ctrl+Shift+I - أدوات المطورين' },
                { ctrl: true, shift: true, key: 'c', message: 'Ctrl+Shift+C - أداة الفحص' },
                { ctrl: true, shift: true, key: 'C', message: 'Ctrl+Shift+C - أداة الفحص' },
                { ctrl: true, shift: true, key: 'j', message: 'Ctrl+Shift+J - وحدة التحكم' },
                { ctrl: true, shift: true, key: 'J', message: 'Ctrl+Shift+J - وحدة التحكم' },
                { ctrl: true, key: 'p', message: 'Ctrl+P - طباعة' },
                { ctrl: true, key: 'P', message: 'Ctrl+P - طباعة' },
                { ctrl: true, key: 's', message: 'Ctrl+S - حفظ الصفحة' },
                { ctrl: true, key: 'S', message: 'Ctrl+S - حفظ الصفحة' }
            ];

            // فحص المفاتيح المنفردة
            if (blockedKeys[e.key]) {
                e.preventDefault();
                this.showAlert(blockedKeys[e.key]);
                this.redirect();
                return false;
            }

            // فحص التركيبات
            for (const combo of blockedCombinations) {
                if (e.ctrlKey === combo.ctrl && 
                    e.shiftKey === (combo.shift || false) && 
                    e.key === combo.key) {
                    e.preventDefault();
                    this.showAlert(combo.message);
                    this.redirect();
                    return false;
                }
            }
        });

        // منع النسخ
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showAlert('نسخ المحتوى');
        });

        document.addEventListener('cut', (e) => {
            e.preventDefault();
            this.showAlert('قص المحتوى');
        });

        // حماية من أدوات المطورين
        this.setupDevToolsProtection();
    },

    // حماية من أدوات المطورين
    setupDevToolsProtection() {
        let devToolsOpen = false;
        
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 100;
            const heightThreshold = window.outerHeight - window.innerHeight > 100;
            
            if ((widthThreshold || heightThreshold) && !devToolsOpen) {
                devToolsOpen = true;
                this.showAlert('فتح أدوات المطورين');
                this.redirect();
            }
        }, 1000);
    }
};

// بدء النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    securitySystem.init();
});
