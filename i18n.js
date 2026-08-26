/*
 * ============================================================
 * MIZAN ANZAN — Global i18n Manager
 * Canonical English Master + Dynamic Global Locale System
 * ============================================================
 *
 * Architecture:
 *
 *   i18n.js
 *      ├── Arabic base locale
 *      ├── Canonical English Master locale
 *      ├── French base locale
 *      ├── 57-language metadata
 *      ├── Dynamic loading for external locales
 *      ├── RTL / LTR management
 *      ├── Persistent language selection
 *      ├── Translation fallback system
 *      └── Global translation API
 *
 * IMPORTANT:
 *   English is intentionally embedded here as the
 *   Canonical English Master.
 *
 *   External:
 *     /assets/js/locales/en.js
 *
 *   may remain as a reference/backup file, but it is NOT
 *   required for the English runtime.
 *
 * ============================================================
 */

(function (global) {
    'use strict';

    /*
     * ----------------------------------------------------------
     * EMBEDDED BASE LOCALES
     * ----------------------------------------------------------
     *
     * Arabic, English and French remain embedded for maximum
     * startup reliability.
     *
     * English is the official Canonical Master.
     * ----------------------------------------------------------
     */

    const I18N = Object.freeze({

        // ======================================================
        // ARABIC
        // ======================================================

        ar: Object.freeze({

            brand_title: 'ميزان أنزان',
            meta_description: 'ميزان أنزان — منصة تدريب الأنزان والسوروبان',
            platform_subtitle: 'منصة الهيئة الدولية للعلماء في التنمية البشرية — فرنسا',

            language_selector_aria: 'اختيار اللغة',
            language_label: 'اللغة',
            change_language: 'تغيير اللغة',
            language_saved: 'تم حفظ تفضيل اللغة.',
            language_loading: 'جارٍ تحميل اللغة...',
            language_unavailable: 'هذه اللغة غير متاحة مؤقتًا.',

            answer_placeholder: 'اكتب الناتج هنا',
            submit_answer: 'إرسال الإجابة',
            invalid_integer: 'يرجى إدخال عدد صحيح صالح.',

            nav_setup: 'إعدادات التدريب',
            nav_leaderboard: 'لوحة الصدارة',
            nav_trainer: 'لوحة المدرب',
            nav_parent: 'لوحة ولي الأمر',
            nav_monthly: 'عباقرة الشهر',
            nav_history: 'سجل التدريب والتقارير',

            back_button: 'رجوع',
            continue_button: 'متابعة',
            cancel_button: 'إلغاء',

            student_code_label: 'كود العبقري:',
            genius_code_label: 'كود العبقري',
            reset_account: 'تسجيل / تغيير الحساب',
            enter_code: 'يرجى إدخال كود العبقري',
            genius_code_placeholder: 'مثال: ANZ-982143',

            preset_kyu_dan_label: 'للمدرب - تحديد مستوى التدريب',
            preset_custom: '-- إعداد يدوي مخصص --',
            preset_kyu_beginner: 'المستوى المبتدئ (Kyu 10 - Kyu 7) | 1-2 خانة - 3-5 صفوف',
            preset_kyu_inter: 'المستوى المتوسط (Kyu 6 - Kyu 4) | 2-3 خانات - 5-8 صفوف',
            preset_kyu_advanced: 'المستوى المتقدم (Kyu 3 - Kyu 1) | 3-5 خانات - 8-12 صفًا',
            preset_dan_pro: 'المستوى الاحترافي (Dan 1 - Dan 5) | 5-8 خانات - 15-25 صفًا',
            preset_dan_master: 'مستوى الماستر (Dan 6 - Dan 10) | 8-10 خانات - 30-50 صفًا',
            preset_olympiad_gm: 'مستوى الأولمبياد العالمي (Grandmaster) | 10-15 خانة - 50-100 صف',

            mode_label: 'نمط التدريب',
            mode_flash: 'أنزان ومضي فلاش',
            mode_flash_desc: 'ظهور الأرقام بالتتابع السريع',
            mode_standard: 'سوروبان عادي (ثابت)',
            mode_standard_desc: 'أرقام كاملة ثابتة',
            mode_flash_short: 'أنزان ومضي',
            mode_standard_short: 'سوروبان عادي',

            level_label: 'المستوى (قواعد السوروبان الصارمة)',
            level_l1: 'L1 - جمع وطرح مباشر (بدون مكملات)',
            level_l2: 'L2 - مكملات 5 (أصدقاء 5)',
            level_l3: 'L3 - مكملات 10 (أصدقاء 10)',
            level_lm: 'LM - خليط شامل (جميع القواعد)',

            age_label: 'الفئة العمرية',
            age_under_6: 'أقل من 6 سنوات',
            age_7_9: '7 - 9 سنوات',
            age_10_12: '10 - 12 سنة',
            age_13_15: '13 - 15 سنة',
            age_16_plus: '16 سنة فما فوق',

            digits_label: 'الخانات',
            rows_label: 'الصفوف',
            op_label: 'نوع العملية',
            op_add: 'جمع فقط',
            op_sub: 'طرح فقط',
            op_mix: 'مختلط (جمع وطرح)',
            op_add_short: 'جمع',
            op_sub_short: 'طرح',
            op_mix_short: 'مختلط',

            duration_label: 'مدة التحدي (ثانية)',
            rest_label: 'زمن الراحة',
            rest_1s: '1 ثانية',
            rest_2s: '2 ثانية',
            rest_3s: '3 ثوانٍ',
            rest_4s: '4 ثوانٍ',
            rest_5s: '5 ثوانٍ',
            speed_label: 'سرعة ظهور الأرقام (بالثواني)',
            tts_label: 'نطق الأرقام',

            start_button: 'بدء التحدي',
            timer_label: 'الزمن المتبقي:',
            score_label: 'النقاط:',
            exit_button: 'إنهاء',

            welcome_title: 'مرحبًا بك في ميزان أنزان',
            welcome_desc: 'يرجى تسجيل بياناتك للمرة الأولى للحصول على كود المتابعة الخاص بك',
            generate_code_btn: 'إنشاء كود العبقري والدخول',
            countdown_start: 'ابدأ!',

            correct_feedback: 'إجابة صحيحة! أحسنت يا عبقري.',
            incorrect_feedback: 'إجابة خاطئة. الإجابة الصحيحة هي:',
            challenge_complete: 'انتهى التحدي!',
            total_score: 'نقاطك الإجمالية:',
            correct_answers: 'عدد الإجابات الصحيحة:',
            of_word: 'من',
            generation_error: 'تعذر توليد تحدٍ صالح بهذه الإعدادات.',

            trainer_title: 'لوحة التحكم للمدرب',
            parent_title: 'لوحة متابعة ولي الأمر',
            portal_desc: 'أدخل كود العبقري لمتابعة التطور والتحليل الدقيق',
            lookup_placeholder: 'أدخل كود العبقري (مثال: ANZ-982143)',
            follow_up: 'عرض',
            tracked_student: 'العبقري المتابع:',
            active_account: 'حساب نشط ومسجل',
            genius_fallback: 'عبقري أنزان',

            focus_metric: 'التركيز',
            accuracy_metric: 'الدقة',
            perf_metric: 'الأداء والسرعة',
            growth_metric: 'التطور',

            leaderboard_title: 'لوحة الصدارة',
            leaderboard_empty: 'لا توجد نتائج بعد.',
            th_rank: '#',
            th_code: 'الكود',
            th_country: 'الدولة',
            th_name: 'اسم العبقري',
            th_mode: 'النمط',
            th_age: 'الفئة العمرية',
            th_level: 'المستوى',
            th_digits: 'الخانات',
            th_rows: 'الصفوف',
            th_operation: 'العملية',
            th_duration: 'المدة',
            th_speed: 'السرعة',
            th_points: 'النقاط',

            monthly_title: 'عباقرة الشهر',
            monthly_award_label: 'عبقري الشهر',
            monthly_description: 'لقب تنافسي يُمنح للعباقرة الذين أظهروا أفضل أداء شامل وموثوق خلال الشهر، بناءً على معايير أداء محددة وشفافة.',
            monthly_failed: 'تعذر تحميل عباقرة الشهر.',
            sessions_metric: 'الجلسات',
            questions_metric: 'الأسئلة',
            points_metric: 'النقاط',
            streak_metric: 'أفضل سلسلة',

            reports_label: 'التقارير',
            cognitive_profile_label: 'الملف المعرفي',

            challenge_invalid: 'تعذر تشغيل التحدي. تحقق من الإعدادات وحاول مرة أخرى.',
            challenge_generation_failed: 'تعذر إنشاء التحدي. لم يبدأ الاختبار. يرجى التحقق من إعدادات التدريب.',
            save_failed: 'تعذر حفظ نتيجة التحدي على الخادم. لم تُحتسب هذه المحاولة في التقارير أو لوحة الصدارة.',
            save_success: 'تم حفظ النتيجة بنجاح وربطها بكود العبقري.',
            save_queued: 'الخادم غير متاح مؤقتًا. تم حفظ المحاولة محليًا وستتم مزامنتها تلقائيًا عند عودة الاتصال.',
            open_report_prompt: 'هل تريد فتح التقرير الآن؟',
            loading_data: 'جارٍ تحميل البيانات...',
            student_not_found: 'لم يتم العثور على العبقري أو تعذر تحميل البيانات.',
            subtract_speech: 'طرح',
            seconds_short: 'ث',

            result_title: 'انتهى التحدي!',
            result_subtitle: 'نتيجة التحدي جاهزة للمراجعة.',
            result_score: 'النقاط الإجمالية:',
            result_correct: 'الإجابات الصحيحة:',
            result_saved: 'تم حفظ النتيجة بنجاح وربطها بكود العبقري.',
            result_open_report: 'فتح التقرير',
            result_continue: 'متابعة',

            registration_title: 'مرحبًا بك في ميزان أنزان',
            registration_desc: 'أنشئ هويتك الآمنة في ميزان أنزان وتابع رحلتك التعليمية الشخصية.',
            registration_language_label: 'لغة التسجيل',
            registration_language_desc: 'اختر اللغة التي تريد استخدامها طوال تجربتك في ميزان أنزان.',

            role_selection_title: 'اختر نوع حسابك',
            role_selection_desc: 'حدد نوع الحساب الذي يصف أفضل طريقة ستستخدم بها ميزان أنزان.',
            role_genius: 'عبقري',
            role_genius_desc: 'للمتعلمين الذين يرغبون في التدريب والتطور ومتابعة رحلتهم التعليمية بأنفسهم.',
            role_coach: 'مدرب',
            role_coach_desc: 'للمدربين الذين يوجهون المتعلمين ويديرون التدريب ويتابعون التقدم.',
            role_parent: 'ولي الأمر',
            role_parent_desc: 'للآباء وأولياء الأمور الذين يرغبون في متابعة الرحلة التعليمية لأطفالهم.',
            role_entity: 'مؤسسة',
            role_entity_desc: 'للمدارس والأكاديميات والمراكز والمعاهد والأندية والاتحادات والمنظمات التدريبية.',

            genius_full_name_label: 'الاسم الكامل للعبقري',
            genius_full_name_placeholder: 'أدخل اسمك الكامل',

            display_name_en_label: 'الاسم الدولي باللغة الإنجليزية',
            display_name_en_placeholder: 'أدخل اسمك باللغة الإنجليزية',
            display_name_en_help: 'سيظهر هذا الاسم في لوحات الصدارة العالمية والمسابقات والشهادات الدولية.',
            display_name_en_required: 'الاسم الدولي باللغة الإنجليزية مطلوب.',
            display_name_en_invalid: 'يرجى إدخال اسم دولي صالح باللغة الإنجليزية.',
            display_name_en_confirm: 'أؤكد أن هذا هو الاسم الذي أريد استخدامه دوليًا.',

            country_label: 'الدولة',
            country_placeholder: 'اختر دولتك',
            country_search_placeholder: 'ابحث عن دولتك',
            country_help: 'ستُستخدم دولتك في التصنيفات والمسابقات الدولية.',

            entity_name_label: 'اسم المؤسسة',
            entity_name_placeholder: 'أدخل اسم المؤسسة',
            entity_type_label: 'نوع المؤسسة',

            entity_type_school: 'مدرسة',
            entity_type_academy: 'أكاديمية',
            entity_type_center: 'مركز تدريب',
            entity_type_institute: 'معهد',
            entity_type_club: 'نادٍ',
            entity_type_educational_institution: 'مؤسسة تعليمية',
            entity_type_federation: 'اتحاد',
            entity_type_training_organization: 'منظمة تدريبية',
            entity_type_other: 'أخرى',

            organization_country: 'دولة المؤسسة',
            organization_city: 'مدينة المؤسسة',

            branch_label: 'الفرع',
            branch_placeholder: 'اختر فرعًا',
            branch_optional: 'اختيار الفرع اختياري',
            branch_main: 'المؤسسة الرئيسية',
            branch_code: 'كود الفرع',
            branch_name: 'اسم الفرع',
            branch_manager: 'مدير الفرع',

            independent_coach: 'مدرب مستقل',
            independent_coach_title: 'مدرب مستقل',
            independent_coach_desc: 'سجل كمدرب مستقل دون الانضمام إلى مؤسسة.',
            independent_coach_note: 'يمكن للمدربين المستقلين التسجيل دون مؤسسة أو فرع.',

            coach_registration_title: 'تسجيل المدرب',
            coach_registration_desc: 'أنشئ حسابك المهني كمدرب في ميزان أنزان.',
            coach_code_label: 'كود المدرب',

            parent_registration_title: 'تسجيل ولي الأمر',
            parent_registration_desc: 'أنشئ حسابك الآمن كولي أمر.',
            parent_code_label: 'كود ولي الأمر',

            entity_code_label: 'كود المؤسسة',
            entity_code_placeholder: 'أدخل كود المؤسسة',
            entity_code_help: 'استخدم هذا الكود للوصول إلى حساب مؤسستك في ميزان أنزان.',

            create_account_button: 'إنشاء الحساب',
            create_genius_account_button: 'إنشاء حساب العبقري',
            create_coach_account_button: 'إنشاء حساب المدرب',
            create_parent_account_button: 'إنشاء حساب ولي الأمر',
            create_organization_account_button: 'إنشاء حساب المؤسسة',

            registration_success_title: 'تم التسجيل بنجاح',
            registration_success_desc: 'تم إنشاء حساب ميزان أنزان الخاص بك بنجاح.',
            your_genius_code: 'كود العبقري الخاص بك',
            your_coach_code: 'كود المدرب الخاص بك',
            your_parent_code: 'كود ولي الأمر الخاص بك',
            your_organization_code: 'كود المؤسسة الخاص بك',
            save_code_warning: 'يرجى حفظ كودك بأمان. ستحتاج إليه للوصول إلى حسابك في ميزان أنزان.',

            link_genius_title: 'ربط عبقري',
            link_genius_desc: 'أدخل كود العبقري الذي قدمه المتعلم.',
            link_genius_button: 'ربط العبقري',

            registration_failed: 'تعذر إكمال التسجيل.',
            server_error: 'تعذر إكمال تسجيلك. يرجى المحاولة مرة أخرى.',
            required_field: 'هذا الحقل مطلوب.',
            invalid_name: 'يرجى إدخال اسم صالح.',
            invalid_english_name: 'يرجى إدخال اسم دولي صالح باللغة الإنجليزية.',
            country_required: 'يرجى اختيار الدولة.',
            role_required: 'يرجى اختيار نوع الحساب.',
            entity_required: 'يرجى إدخال معلومات المؤسسة.',
            branch_required: 'يرجى اختيار فرع.',
            code_invalid: 'الكود غير صالح.',
            code_not_found: 'تعذر العثور على الكود.',
            code_already_used: 'هذا الكود مستخدم بالفعل.',
            network_error: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',

            change_account_type: 'تغيير نوع الحساب',
            switch_account: 'تبديل الحساب',

            international_name_privacy: 'قد يظهر اسمك الدولي في لوحات الصدارة العالمية والشهادات والمسابقات.',
            leaderboard_name_notice: 'يُستخدم اسمك الدولي للتعريف بك في التصنيفات العامة.',
            privacy_notice: 'تُستخدم معلوماتك الشخصية لتوفير حسابك في ميزان أنزان وحمايته.',

            version_label: 'Soroban Core v3.1',
            fullname_label: "الاسم الكامل للعبقري/ـة",
            fullname_ph: "أدخل اسمك الكامل",
            country_ph: "مثال: فرنسا، مصر، السعودية",
        }),

        // ======================================================
        // CANONICAL ENGLISH MASTER
        // ======================================================

        en: Object.freeze({

            // --------------------------------------------------
            // BRAND & PLATFORM
            // --------------------------------------------------

            brand_title: "MIZAN ANZAN",
            meta_description: "Mizan Anzan — professional Anzan and Soroban training platform",
            platform_subtitle: "Platform of the International Commission of Scientists for Human Development — France",
            version_label: "Soroban Core v3.1",
            fullname_label: "Full Genius Name",
            fullname_ph: "Enter your full name",
            country_ph: "Example: France, Egypt, KSA",

            // --------------------------------------------------
            // LANGUAGE & UI
            // --------------------------------------------------

            language_selector_aria: "Language selection",
            language_label: "Language",
            change_language: "Change Language",
            language_saved: "Language preference saved.",
            language_loading: "Loading language...",
            language_unavailable: "This language is temporarily unavailable.",

            // --------------------------------------------------
            // ANSWER & INPUT
            // --------------------------------------------------

            answer_placeholder: "Enter the result here",
            submit_answer: "Submit Answer",
            invalid_integer: "Please enter a valid integer.",

            // --------------------------------------------------
            // NAVIGATION
            // --------------------------------------------------

            nav_setup: "Training Settings",
            nav_leaderboard: "Leaderboard",
            nav_trainer: "Coach Panel",
            nav_parent: "Parent Panel",
            nav_monthly: "Geniuses of the Month",
            nav_history: "Training History & Reports",
            back_button: "Back",
            continue_button: "Continue",
            cancel_button: "Cancel",

            // --------------------------------------------------
            // GENIUS CODE
            // --------------------------------------------------

            student_code_label: "Genius Code:",
            genius_code_label: "Genius Code",
            reset_account: "Register / Switch Account",
            enter_code: "Please enter the Genius Code",
            genius_code_placeholder: "Example: ANZ-982143",

            // --------------------------------------------------
            // PRESETS (COACH)
            // --------------------------------------------------

            preset_kyu_dan_label: "Coach - Set Training Level",
            preset_custom: "-- Custom Manual Setup --",
            preset_kyu_beginner: "Beginner Level (Kyu 10 - Kyu 7) | 1-2 Digits - 3-5 Rows",
            preset_kyu_inter: "Intermediate Level (Kyu 6 - Kyu 4) | 2-3 Digits - 5-8 Rows",
            preset_kyu_advanced: "Advanced Level (Kyu 3 - Kyu 1) | 3-5 Digits - 8-12 Rows",
            preset_dan_pro: "Professional Level (Dan 1 - Dan 5) | 5-8 Digits - 15-25 Rows",
            preset_dan_master: "Master Level (Dan 6 - Dan 10) | 8-10 Digits - 30-50 Rows",
            preset_olympiad_gm: "World Olympiad Level (Grandmaster) | 10-15 Digits - 50-100 Rows",

            // --------------------------------------------------
            // TRAINING MODE
            // --------------------------------------------------

            mode_label: "Training Mode",
            mode_flash: "Flash Anzan",
            mode_flash_desc: "High-speed sequential flash",
            mode_standard: "Standard Soroban (Static)",
            mode_standard_desc: "Full static numbers display",
            mode_flash_short: "Flash Anzan",
            mode_standard_short: "Standard Soroban",

            // --------------------------------------------------
            // LEVEL
            // --------------------------------------------------

            level_label: "Level (Strict Soroban Rules)",
            level_l1: "L1 - Direct Add/Sub (No Complements)",
            level_l2: "L2 - Friends of 5 (5 Complements)",
            level_l3: "L3 - Friends of 10 (10 Complements)",
            level_lm: "LM - Mixed Comprehensive (All Rules)",

            // --------------------------------------------------
            // AGE GROUP
            // --------------------------------------------------

            age_label: "Age Group",
            age_under_6: "Under 6 years",
            age_7_9: "7 - 9 years",
            age_10_12: "10 - 12 years",
            age_13_15: "13 - 15 years",
            age_16_plus: "16+ years",

            // --------------------------------------------------
            // DIGITS / ROWS / OPERATION
            // --------------------------------------------------

            digits_label: "Digits",
            rows_label: "Rows",
            op_label: "Operation Type",
            op_add: "Addition Only",
            op_sub: "Subtraction Only",
            op_mix: "Mixed (Add & Sub)",
            op_add_short: "Addition",
            op_sub_short: "Subtraction",
            op_mix_short: "Mixed",

            // --------------------------------------------------
            // DURATION / REST / SPEED / TTS
            // --------------------------------------------------

            duration_label: "Challenge Time (sec)",
            rest_label: "Rest Time",
            rest_1s: "1 Second",
            rest_2s: "2 Seconds",
            rest_3s: "3 Seconds",
            rest_4s: "4 Seconds",
            rest_5s: "5 Seconds",
            speed_label: "Display Speed (seconds)",
            tts_label: "Number Pronunciation",

            // --------------------------------------------------
            // CHALLENGE CONTROLS
            // --------------------------------------------------

            start_button: "Start Challenge",
            timer_label: "Time Remaining:",
            score_label: "Score:",
            exit_button: "Exit",

            // --------------------------------------------------
            // WELCOME / REGISTRATION LEGACY
            // --------------------------------------------------

            welcome_title: "Welcome to Mizan Anzan",
            welcome_desc: "Please register your details to generate your tracking code",
            generate_code_btn: "Generate Genius Code & Enter",
            countdown_start: "START!",

            // --------------------------------------------------
            // FEEDBACK & CHALLENGE
            // --------------------------------------------------

            correct_feedback: "Correct answer! Great job, genius.",
            incorrect_feedback: "Incorrect. Correct answer was:",
            challenge_complete: "Challenge Complete!",
            total_score: "Total Score:",
            correct_answers: "Correct Answers:",
            of_word: "of",
            generation_error: "Unable to generate a valid challenge with these settings.",

            // --------------------------------------------------
            // COACH & PARENT PANELS
            // --------------------------------------------------

            trainer_title: "Coach Control Panel",
            parent_title: "Learning Journey Panel",
            portal_desc: "Enter the Genius Code to view progress and detailed analysis",
            lookup_placeholder: "Enter Genius Code (e.g. ANZ-982143)",
            follow_up: "View",
            tracked_student: "Tracked Genius:",
            active_account: "Active registered account",
            genius_fallback: "Anzan Genius",

            // --------------------------------------------------
            // METRICS
            // --------------------------------------------------

            focus_metric: "Focus",
            accuracy_metric: "Accuracy",
            perf_metric: "Performance & Speed",
            growth_metric: "Growth",

            // --------------------------------------------------
            // LEADERBOARD
            // --------------------------------------------------

            leaderboard_title: "Leaderboard",
            leaderboard_empty: "No results yet.",
            th_rank: "#",
            th_code: "Code",
            th_country: "Country",
            th_name: "Genius Name",
            th_mode: "Mode",
            th_age: "Age Group",
            th_level: "Level",
            th_digits: "Digits",
            th_rows: "Rows",
            th_operation: "Operation",
            th_duration: "Duration",
            th_speed: "Speed",
            th_points: "Points",

            // --------------------------------------------------
            // MONTHLY GENIUSES
            // --------------------------------------------------

            monthly_title: "Geniuses of the Month",
            monthly_award_label: "Genius of the Month",
            monthly_description: "A competitive title awarded to geniuses who demonstrated the best comprehensive and reliable performance during the month, based on specific and transparent performance criteria.",
            monthly_failed: "Unable to load the geniuses of the month.",
            sessions_metric: "Sessions",
            questions_metric: "Questions",
            points_metric: "Points",
            streak_metric: "Best Streak",

            // --------------------------------------------------
            // REPORTS & COGNITIVE PROFILE
            // --------------------------------------------------

            reports_label: "Reports",
            cognitive_profile_label: "Cognitive Profile",

            // --------------------------------------------------
            // MESSAGES & ERRORS
            // --------------------------------------------------

            challenge_invalid: "The challenge could not start. Check the settings and try again.",
            challenge_generation_failed: "The challenge could not be generated. The test did not start. Please check the training settings.",
            save_failed: "The challenge result could not be saved on the server. This attempt was not counted in reports or the leaderboard.",
            save_success: "The result was saved successfully and linked to the Genius Code.",
            save_queued: "The server is temporarily unavailable. This attempt was stored locally and will be synchronized automatically when the connection returns.",
            open_report_prompt: "Would you like to open the report now?",
            loading_data: "Loading data...",
            student_not_found: "The Genius could not be found or the data could not be loaded.",
            subtract_speech: "Subtraction",
            seconds_short: "s",

            // --------------------------------------------------
            // RESULT
            // --------------------------------------------------

            result_title: "Challenge Complete!",
            result_subtitle: "Your challenge result is ready for review.",
            result_score: "Total Score:",
            result_correct: "Correct Answers:",
            result_saved: "The result was saved successfully and linked to the Genius Code.",
            result_open_report: "Open Report",
            result_continue: "Continue",

            // --------------------------------------------------
            // REGISTRATION & IDENTITY
            // --------------------------------------------------

            registration_title: "Welcome to MIZAN ANZAN",
            registration_desc: "Create your secure MIZAN identity and continue to your personalized learning journey.",
            registration_language_label: "Registration Language",
            registration_language_desc: "Choose the language you want to use throughout your MIZAN experience.",

            // --------------------------------------------------
            // ROLE SELECTION
            // --------------------------------------------------

            role_selection_title: "Choose your account type",
            role_selection_desc: "Select the account type that best describes how you will use MIZAN.",
            role_genius: "Genius",
            role_genius_desc: "For learners who want to train, improve and track their own learning journey.",
            role_coach: "Coach",
            role_coach_desc: "For trainers who guide learners, manage training and track progress.",
            role_parent: "Parent",
            role_parent_desc: "For parents or guardians who want to follow their child's learning journey.",
            role_entity: "Organization",
            role_entity_desc: "For schools, academies, centers, institutes, clubs, federations and training organizations.",

            // --------------------------------------------------
            // GENIUS FULL NAME
            // --------------------------------------------------

            genius_full_name_label: "Genius Full Name",
            genius_full_name_placeholder: "Enter your full name",

            // --------------------------------------------------
            // INTERNATIONAL NAME
            // --------------------------------------------------

            display_name_en_label: "International Name in English",
            display_name_en_placeholder: "Enter your name in English",
            display_name_en_help: "This is the name that will appear on global leaderboards, competitions and international certificates.",
            display_name_en_required: "Your international English name is required.",
            display_name_en_invalid: "Please enter a valid international name in English.",
            display_name_en_confirm: "I confirm that this is the name I want to use internationally.",

            // --------------------------------------------------
            // COUNTRY
            // --------------------------------------------------

            country_label: "Country",
            country_placeholder: "Select your country",
            country_search_placeholder: "Search for your country",
            country_help: "Your country will be used for international rankings and competitions.",

            // --------------------------------------------------
            // ORGANIZATION
            // --------------------------------------------------

            entity_name_label: "Organization Name",
            entity_name_placeholder: "Enter the organization name",
            entity_type_label: "Organization Type",

            // --------------------------------------------------
            // ORGANIZATION TYPES
            // --------------------------------------------------

            entity_type_school: "School",
            entity_type_academy: "Academy",
            entity_type_center: "Training Center",
            entity_type_institute: "Institute",
            entity_type_club: "Club",
            entity_type_educational_institution: "Educational Institution",
            entity_type_federation: "Federation",
            entity_type_training_organization: "Training Organization",
            entity_type_other: "Other",

            // --------------------------------------------------
            // ORGANIZATION DETAILS
            // --------------------------------------------------

            organization_country: "Organization Country",
            organization_city: "Organization City",

            // --------------------------------------------------
            // BRANCH
            // --------------------------------------------------

            branch_label: "Branch",
            branch_placeholder: "Select a branch",
            branch_optional: "Branch selection is optional",
            branch_main: "Main Organization",
            branch_code: "Branch Code",
            branch_name: "Branch Name",
            branch_manager: "Branch Manager",

            // --------------------------------------------------
            // INDEPENDENT COACH
            // --------------------------------------------------

            independent_coach: "Independent Coach",
            independent_coach_title: "Independent Coach",
            independent_coach_desc: "Register as an independent coach without joining an organization.",
            independent_coach_note: "Independent coaches can register without an organization or branch.",

            // --------------------------------------------------
            // COACH REGISTRATION
            // --------------------------------------------------

            coach_registration_title: "Coach Registration",
            coach_registration_desc: "Create your professional MIZAN Coach account.",
            coach_code_label: "Coach Code",

            // --------------------------------------------------
            // PARENT REGISTRATION
            // --------------------------------------------------

            parent_registration_title: "Parent Registration",
            parent_registration_desc: "Create your secure parent or guardian account.",
            parent_code_label: "Parent Code",

            // --------------------------------------------------
            // ORGANIZATION CODE
            // --------------------------------------------------

            entity_code_label: "Organization Code",
            entity_code_placeholder: "Enter your Organization Code",
            entity_code_help: "Use this code to access your organization's MIZAN account.",

            // --------------------------------------------------
            // CREATE ACCOUNT BUTTONS
            // --------------------------------------------------

            create_account_button: "Create Account",
            create_genius_account_button: "Create Genius Account",
            create_coach_account_button: "Create Coach Account",
            create_parent_account_button: "Create Parent Account",
            create_organization_account_button: "Create Organization Account",

            // --------------------------------------------------
            // REGISTRATION SUCCESS
            // --------------------------------------------------

            registration_success_title: "Registration Successful",
            registration_success_desc: "Your MIZAN account has been created successfully.",
            your_genius_code: "Your Genius Code",
            your_coach_code: "Your Coach Code",
            your_parent_code: "Your Parent Code",
            your_organization_code: "Your Organization Code",
            save_code_warning: "Please save your code securely. You will need it to access your MIZAN account.",

            // --------------------------------------------------
            // LINK GENIUS
            // --------------------------------------------------

            link_genius_title: "Link a Genius",
            link_genius_desc: "Enter the Genius Code provided by the learner.",
            link_genius_button: "Link Genius",

            // --------------------------------------------------
            // REGISTRATION ERRORS
            // --------------------------------------------------

            registration_failed: "Registration could not be completed.",
            server_error: "We could not complete your registration. Please try again.",
            required_field: "This field is required.",
            invalid_name: "Please enter a valid name.",
            invalid_english_name: "Please enter a valid international name in English.",
            country_required: "Please select your country.",
            role_required: "Please select an account type.",
            entity_required: "Please enter your organization information.",
            branch_required: "Please select a branch.",
            code_invalid: "The code is invalid.",
            code_not_found: "The code could not be found.",
            code_already_used: "This code is already in use.",
            network_error: "A connection error occurred. Please try again.",

            // --------------------------------------------------
            // ACCOUNT SWITCHING
            // --------------------------------------------------

            change_account_type: "Change Account Type",
            switch_account: "Switch Account",

            // --------------------------------------------------
            // PRIVACY & INTERNATIONAL USAGE
            // --------------------------------------------------

            international_name_privacy: "Your international name may appear on global leaderboards, certificates and competitions.",
            leaderboard_name_notice: "Your international name is used to identify you in public rankings.",
            privacy_notice: "Your personal information is used to provide and protect your MIZAN account.",
        }),

        // ======================================================
        // FRENCH
        // ======================================================

        fr: Object.freeze({

            brand_title: 'MIZAN ANZAN',
            meta_description: 'Mizan Anzan — plateforme professionnelle d’entraînement à l’Anzan et au Soroban',
            platform_subtitle: 'Plateforme de la Commission internationale des scientifiques du développement humain — France',

            language_selector_aria: 'Sélection de la langue',
            language_label: 'Langue',
            change_language: 'Changer de langue',
            language_saved: 'Préférence linguistique enregistrée.',
            language_loading: 'Chargement de la langue...',
            language_unavailable: 'Cette langue est temporairement indisponible.',

            answer_placeholder: 'Saisissez le résultat ici',
            submit_answer: 'Valider la réponse',
            invalid_integer: 'Veuillez saisir un nombre entier valide.',

            nav_setup: 'Paramètres d’entraînement',
            nav_leaderboard: 'Classement',
            nav_trainer: 'Espace coach',
            nav_parent: 'Espace parent',
            nav_monthly: 'Génies du mois',
            nav_history: 'Historique et rapports',

            back_button: 'Retour',
            continue_button: 'Continuer',
            cancel_button: 'Annuler',

            student_code_label: 'Code du génie :',
            genius_code_label: 'Code du génie',
            reset_account: 'Inscription / Changer de compte',
            enter_code: 'Veuillez saisir le code du génie',
            genius_code_placeholder: 'Exemple : ANZ-982143',

            preset_kyu_dan_label: 'Coach - Définir le niveau',
            preset_custom: '-- Configuration personnalisée --',
            preset_kyu_beginner: 'Niveau débutant (Kyu 10 - Kyu 7) | 1-2 chiffres - 3-5 lignes',
            preset_kyu_inter: 'Niveau intermédiaire (Kyu 6 - Kyu 4) | 2-3 chiffres - 5-8 lignes',
            preset_kyu_advanced: 'Niveau avancé (Kyu 3 - Kyu 1) | 3-5 chiffres - 8-12 lignes',
            preset_dan_pro: 'Niveau professionnel (Dan 1 - Dan 5) | 5-8 chiffres - 15-25 lignes',
            preset_dan_master: 'Niveau Master (Dan 6 - Dan 10) | 8-10 chiffres - 30-50 lignes',
            preset_olympiad_gm: 'Niveau Olympiade mondiale (Grandmaster) | 10-15 chiffres - 50-100 lignes',

            mode_label: 'Mode d’entraînement',
            mode_flash: 'Anzan Flash',
            mode_flash_desc: 'Affichage séquentiel à grande vitesse',
            mode_standard: 'Soroban standard (statique)',
            mode_standard_desc: 'Affichage complet et fixe des nombres',
            mode_flash_short: 'Anzan Flash',
            mode_standard_short: 'Soroban standard',

            level_label: 'Niveau (règles strictes du Soroban)',
            level_l1: 'L1 — Addition/Soustraction directe (sans compléments)',
            level_l2: 'L2 — Compléments de 5 (amis de 5)',
            level_l3: 'L3 — Compléments de 10 (amis de 10)',
            level_lm: 'LM — Mix complet (toutes les règles)',

            age_label: 'Tranche d’âge',
            age_under_6: 'Moins de 6 ans',
            age_7_9: '7 - 9 ans',
            age_10_12: '10 - 12 ans',
            age_13_15: '13 - 15 ans',
            age_16_plus: '16 ans et plus',

            digits_label: 'Chiffres',
            rows_label: 'Lignes',
            op_label: 'Type d’opération',
            op_add: 'Addition uniquement',
            op_sub: 'Soustraction uniquement',
            op_mix: 'Mixte (addition et soustraction)',
            op_add_short: 'Addition',
            op_sub_short: 'Soustraction',
            op_mix_short: 'Mixte',

            duration_label: 'Durée du défi (secondes)',
            rest_label: 'Temps de repos',
            rest_1s: '1 seconde',
            rest_2s: '2 secondes',
            rest_3s: '3 secondes',
            rest_4s: '4 secondes',
            rest_5s: '5 secondes',
            speed_label: 'Vitesse d’affichage (secondes)',
            tts_label: 'Prononciation des nombres',

            start_button: 'Commencer le défi',
            timer_label: 'Temps restant :',
            score_label: 'Score :',
            exit_button: 'Quitter',

            welcome_title: 'Bienvenue sur Mizan Anzan',
            welcome_desc: 'Inscrivez vos informations pour obtenir votre code de suivi',
            generate_code_btn: 'Créer le code du génie et entrer',
            countdown_start: 'DÉPART !',

            correct_feedback: 'Bonne réponse ! Bravo, génie.',
            incorrect_feedback: 'Réponse incorrecte. La bonne réponse était :',
            challenge_complete: 'Défi terminé !',
            total_score: 'Score total :',
            correct_answers: 'Bonnes réponses :',
            of_word: 'sur',
            generation_error: 'Impossible de générer un défi valide avec ces paramètres.',

            trainer_title: 'Tableau de bord du coach',
            parent_title: 'Tableau de suivi des parents',
            portal_desc: 'Saisissez le code du génie pour suivre sa progression et son analyse détaillée',
            lookup_placeholder: 'Saisissez le code du génie (ex. ANZ-982143)',
            follow_up: 'Voir',
            tracked_student: 'Génie suivi :',
            active_account: 'Compte actif et enregistré',
            genius_fallback: 'Génie Anzan',

            focus_metric: 'Concentration',
            accuracy_metric: 'Précision',
            perf_metric: 'Performance et vitesse',
            growth_metric: 'Progression',

            leaderboard_title: 'Classement',
            leaderboard_empty: 'Aucun résultat pour le moment.',
            th_rank: '#',
            th_code: 'Code',
            th_country: 'Pays',
            th_name: 'Nom du génie',
            th_mode: 'Mode',
            th_age: 'Âge',
            th_level: 'Niveau',
            th_digits: 'Chiffres',
            th_rows: 'Lignes',
            th_operation: 'Opération',
            th_duration: 'Durée',
            th_speed: 'Vitesse',
            th_points: 'Points',

            monthly_title: 'Génies du mois',
            monthly_award_label: 'Génie du mois',
            monthly_description: 'Un titre compétitif attribué aux génies ayant démontré les meilleures performances globales et fiables au cours du mois, selon des critères de performance spécifiques et transparents.',
            monthly_failed: 'Impossible de charger les génies du mois.',
            sessions_metric: 'Séances',
            questions_metric: 'Questions',
            points_metric: 'Points',
            streak_metric: 'Meilleure série',

            reports_label: 'Rapports',
            cognitive_profile_label: 'Profil cognitif',

            challenge_invalid: 'Le défi ne peut pas démarrer. Vérifiez les paramètres puis réessayez.',
            challenge_generation_failed: 'Impossible de générer le défi. Le test n’a pas démarré. Vérifiez les paramètres d’entraînement.',
            save_failed: 'Le résultat du défi n’a pas pu être enregistré sur le serveur. Cette tentative n’a pas été comptabilisée dans les rapports ou le classement.',
            save_success: 'Le résultat a été enregistré et lié au code du génie.',
            save_queued: 'Le serveur est temporairement indisponible. Cette tentative est conservée localement et sera synchronisée automatiquement au retour de la connexion.',
            open_report_prompt: 'Voulez-vous ouvrir le rapport maintenant ?',
            loading_data: 'Chargement des données...',
            student_not_found: 'Génie introuvable ou données impossibles à charger.',
            subtract_speech: 'Soustraction',
            seconds_short: 's',

            result_title: 'Défi terminé !',
            result_subtitle: 'Votre résultat est prêt à être consulté.',
            result_score: 'Score total :',
            result_correct: 'Bonnes réponses :',
            result_saved: 'Le résultat a été enregistré et lié au code du génie.',
            result_open_report: 'Ouvrir le rapport',
            result_continue: 'Continuer',

            registration_title: 'Bienvenue sur MIZAN ANZAN',
            registration_desc: 'Créez votre identité MIZAN sécurisée et poursuivez votre parcours d’apprentissage personnalisé.',
            registration_language_label: 'Langue d’inscription',
            registration_language_desc: 'Choisissez la langue que vous souhaitez utiliser dans votre expérience MIZAN.',

            role_selection_title: 'Choisissez votre type de compte',
            role_selection_desc: 'Sélectionnez le type de compte qui décrit le mieux votre utilisation de MIZAN.',
            role_genius: 'Génie',
            role_genius_desc: 'Pour les apprenants qui souhaitent s’entraîner, progresser et suivre leur propre parcours.',
            role_coach: 'Coach',
            role_coach_desc: 'Pour les formateurs qui accompagnent les apprenants, gèrent l’entraînement et suivent les progrès.',
            role_parent: 'Parent',
            role_parent_desc: 'Pour les parents ou tuteurs qui souhaitent suivre le parcours d’apprentissage de leur enfant.',
            role_entity: 'Organisation',
            role_entity_desc: 'Pour les écoles, académies, centres, instituts, clubs, fédérations et organisations de formation.',

            genius_full_name_label: 'Nom complet du génie',
            genius_full_name_placeholder: 'Saisissez votre nom complet',

            display_name_en_label: 'Nom international en anglais',
            display_name_en_placeholder: 'Saisissez votre nom en anglais',
            display_name_en_help: 'Ce nom apparaîtra dans les classements mondiaux, les compétitions et les certificats internationaux.',
            display_name_en_required: 'Votre nom international en anglais est requis.',
            display_name_en_invalid: 'Veuillez saisir un nom international valide en anglais.',
            display_name_en_confirm: 'Je confirme que c’est le nom que je souhaite utiliser à l’international.',

            country_label: 'Pays',
            country_placeholder: 'Sélectionnez votre pays',
            country_search_placeholder: 'Recherchez votre pays',
            country_help: 'Votre pays sera utilisé pour les classements et compétitions internationales.',

            entity_name_label: 'Nom de l’organisation',
            entity_name_placeholder: 'Saisissez le nom de l’organisation',
            entity_type_label: 'Type d’organisation',

            entity_type_school: 'École',
            entity_type_academy: 'Académie',
            entity_type_center: 'Centre de formation',
            entity_type_institute: 'Institut',
            entity_type_club: 'Club',
            entity_type_educational_institution: 'Établissement éducatif',
            entity_type_federation: 'Fédération',
            entity_type_training_organization: 'Organisation de formation',
            entity_type_other: 'Autre',

            organization_country: 'Pays de l’organisation',
            organization_city: 'Ville de l’organisation',

            branch_label: 'Branche',
            branch_placeholder: 'Sélectionnez une branche',
            branch_optional: 'La sélection d’une branche est facultative',
            branch_main: 'Organisation principale',
            branch_code: 'Code de branche',
            branch_name: 'Nom de la branche',
            branch_manager: 'Responsable de la branche',

            independent_coach: 'Coach indépendant',
            independent_coach_title: 'Coach indépendant',
            independent_coach_desc: 'Inscrivez-vous comme coach indépendant sans rejoindre une organisation.',
            independent_coach_note: 'Les coachs indépendants peuvent s’inscrire sans organisation ni branche.',

            coach_registration_title: 'Inscription du coach',
            coach_registration_desc: 'Créez votre compte professionnel MIZAN Coach.',
            coach_code_label: 'Code du coach',

            parent_registration_title: 'Inscription du parent',
            parent_registration_desc: 'Créez votre compte sécurisé de parent ou tuteur.',
            parent_code_label: 'Code du parent',

            entity_code_label: 'Code de l’organisation',
            entity_code_placeholder: 'Saisissez le code de l’organisation',
            entity_code_help: 'Utilisez ce code pour accéder au compte MIZAN de votre organisation.',

            create_account_button: 'Créer un compte',
            create_genius_account_button: 'Créer un compte Génie',
            create_coach_account_button: 'Créer un compte Coach',
            create_parent_account_button: 'Créer un compte Parent',
            create_organization_account_button: 'Créer un compte Organisation',

            registration_success_title: 'Inscription réussie',
            registration_success_desc: 'Votre compte MIZAN a été créé avec succès.',
            your_genius_code: 'Votre code Génie',
            your_coach_code: 'Votre code Coach',
            your_parent_code: 'Votre code Parent',
            your_organization_code: 'Votre code Organisation',
            save_code_warning: 'Veuillez conserver votre code en lieu sûr. Vous en aurez besoin pour accéder à votre compte MIZAN.',

            link_genius_title: 'Lier un génie',
            link_genius_desc: 'Saisissez le code Génie fourni par l’apprenant.',
            link_genius_button: 'Lier le génie',

            registration_failed: 'L’inscription n’a pas pu être terminée.',
            server_error: 'Nous n’avons pas pu terminer votre inscription. Veuillez réessayer.',
            required_field: 'Ce champ est obligatoire.',
            invalid_name: 'Veuillez saisir un nom valide.',
            invalid_english_name: 'Veuillez saisir un nom international valide en anglais.',
            country_required: 'Veuillez sélectionner votre pays.',
            role_required: 'Veuillez sélectionner un type de compte.',
            entity_required: 'Veuillez saisir les informations de votre organisation.',
            branch_required: 'Veuillez sélectionner une branche.',
            code_invalid: 'Le code est invalide.',
            code_not_found: 'Le code est introuvable.',
            code_already_used: 'Ce code est déjà utilisé.',
            network_error: 'Une erreur de connexion est survenue. Veuillez réessayer.',

            change_account_type: 'Changer de type de compte',
            switch_account: 'Changer de compte',

            international_name_privacy: 'Votre nom international peut apparaître dans les classements mondiaux, les certificats et les compétitions.',
            leaderboard_name_notice: 'Votre nom international est utilisé pour vous identifier dans les classements publics.',
            privacy_notice: 'Vos informations personnelles sont utilisées pour fournir et protéger votre compte MIZAN.',

            version_label: 'Soroban Core v3.1',
            fullname_label: "Nom complet du génie",
            fullname_ph: "Saisissez votre nom complet",
            country_ph: "Exemple : France, Égypte, Arabie saoudite",
        })
    });


    // Legacy/global locale registry compatibility.
    global.I18nLocales = global.I18nLocales || {};
    global.I18nLocales.ar = I18N.ar;
    global.I18nLocales.en = I18N.en;
    global.I18nLocales.fr = I18N.fr;

    /*
     * ----------------------------------------------------------
     * LANGUAGE METADATA
     * ----------------------------------------------------------
     */

    const LANGUAGE_META = Object.freeze({

        ar: {
            name: 'Arabic',
            native: 'العربية',
            flag: '🇸🇦',
            dir: 'rtl',
            speech: 'ar-SA'
        },

        en: {
            name: 'English',
            native: 'English',
            flag: '🇺🇸',
            dir: 'ltr',
            speech: 'en-US'
        },

        fr: {
            name: 'French',
            native: 'Français',
            flag: '🇫🇷',
            dir: 'ltr',
            speech: 'fr-FR'
        },

        ber: {
            name: 'Tamazight',
            native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
            flag: '🇲🇦',
            dir: 'ltr',
            speech: 'ber-DZ'
        },

        ku: {
            name: 'Kurdî (Kurmancî)',
            native: 'Kurdî (Kurmancî)',
            flag: '🏴',
            dir: 'ltr',
            speech: 'ku-TR'
        },

        ckb: {
            name: 'Kurdî (Soranî)',
            native: 'کوردی (سۆرانی)',
            flag: '🇮🇶',
            dir: 'rtl',
            speech: 'ckb-IQ'
        },

        am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', dir: 'ltr', speech: 'am-ET' },
        az: { name: 'Azerbaijani', native: 'Azərbaycanca', flag: '🇦🇿', dir: 'ltr', speech: 'az-AZ' },
        bg: { name: 'Bulgarian', native: 'Български', flag: '🇧🇬', dir: 'ltr', speech: 'bg-BG' },
        bn: { name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', dir: 'ltr', speech: 'bn-BD' },
        cs: { name: 'Czech', native: 'Čeština', flag: '🇨🇿', dir: 'ltr', speech: 'cs-CZ' },
        da: { name: 'Danish', native: 'Dansk', flag: '🇩🇰', dir: 'ltr', speech: 'da-DK' },
        de: { name: 'German', native: 'Deutsch', flag: '🇩🇪', dir: 'ltr', speech: 'de-DE' },
        el: { name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', dir: 'ltr', speech: 'el-GR' },
        es: { name: 'Spanish', native: 'Español', flag: '🇪🇸', dir: 'ltr', speech: 'es-ES' },
        et: { name: 'Estonian', native: 'Eesti', flag: '🇪🇪', dir: 'ltr', speech: 'et-EE' },
        fa: { name: 'Persian', native: 'فارسی', flag: '🇮🇷', dir: 'rtl', speech: 'fa-IR' },
        fi: { name: 'Finnish', native: 'Suomi', flag: '🇫🇮', dir: 'ltr', speech: 'fi-FI' },
        ga: { name: 'Irish', native: 'Gaeilge', flag: '🇮🇪', dir: 'ltr', speech: 'ga-IE' },
        ha: { name: 'Hausa', native: 'Hausa', flag: '🇳🇬', dir: 'ltr', speech: 'ha-NG' },
        hi: { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', dir: 'ltr', speech: 'hi-IN' },
        hr: { name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷', dir: 'ltr', speech: 'hr-HR' },
        hu: { name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', dir: 'ltr', speech: 'hu-HU' },
        id: { name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', speech: 'id-ID' },
        it: { name: 'Italian', native: 'Italiano', flag: '🇮🇹', dir: 'ltr', speech: 'it-IT' },
        ja: { name: 'Japanese', native: '日本語', flag: '🇯🇵', dir: 'ltr', speech: 'ja-JP' },
        ka: { name: 'Georgian', native: 'ქართული', flag: '🇬🇪', dir: 'ltr', speech: 'ka-GE' },
        kk: { name: 'Kazakh', native: 'Қазақша', flag: '🇰🇿', dir: 'ltr', speech: 'kk-KZ' },
        ko: { name: 'Korean', native: '한국어', flag: '🇰🇷', dir: 'ltr', speech: 'ko-KR' },
        lt: { name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹', dir: 'ltr', speech: 'lt-LT' },
        lv: { name: 'Latvian', native: 'Latviešu', flag: '🇱🇻', dir: 'ltr', speech: 'lv-LV' },
        ms: { name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr', speech: 'ms-MY' },
        mt: { name: 'Maltese', native: 'Malti', flag: '🇲🇹', dir: 'ltr', speech: 'mt-MT' },
        my: { name: 'Burmese', native: 'မြန်မာစာ', flag: '🇲🇲', dir: 'ltr', speech: 'my-MM' },
        nl: { name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', dir: 'ltr', speech: 'nl-NL' },
        no: { name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', dir: 'ltr', speech: 'nb-NO' },
        pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr', speech: 'pa-IN' },
        pl: { name: 'Polish', native: 'Polski', flag: '🇵🇱', dir: 'ltr', speech: 'pl-PL' },
        prs: { name: 'Dari', native: 'دری', flag: '🇦🇫', dir: 'rtl', speech: 'prs-AF' },
        ps: { name: 'Pashto', native: 'پښتو', flag: '🇦🇫', dir: 'rtl', speech: 'ps-AF' },
        pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹', dir: 'ltr', speech: 'pt-PT' },
        qu: { name: 'Quechua', native: 'Runasimi', flag: '🇵🇪', dir: 'ltr', speech: 'qu-PE' },
        ro: { name: 'Romanian', native: 'Română', flag: '🇷🇴', dir: 'ltr', speech: 'ro-RO' },
        ru: { name: 'Russian', native: 'Русский', flag: '🇷🇺', dir: 'ltr', speech: 'ru-RU' },
        si: { name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰', dir: 'ltr', speech: 'si-LK' },
        sk: { name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰', dir: 'ltr', speech: 'sk-SK' },
        sl: { name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮', dir: 'ltr', speech: 'sl-SI' },
        sv: { name: 'Swedish', native: 'Svenska', flag: '🇸🇪', dir: 'ltr', speech: 'sv-SE' },
        sw: { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿', dir: 'ltr', speech: 'sw-TZ' },
        th: { name: 'Thai', native: 'ไทย', flag: '🇹🇭', dir: 'ltr', speech: 'th-TH' },
        tl: { name: 'Tagalog', native: 'Tagalog', flag: '🇵🇭', dir: 'ltr', speech: 'tl-PH' },
        tr: { name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', dir: 'ltr', speech: 'tr-TR' },
        uk: { name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', dir: 'ltr', speech: 'uk-UA' },
        ur: { name: 'Urdu', native: 'اردو', flag: '🇵🇰', dir: 'rtl', speech: 'ur-PK' },
        uz: { name: 'Uzbek', native: 'O‘zbekcha', flag: '🇺🇿', dir: 'ltr', speech: 'uz-UZ' },
        vi: { name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr', speech: 'vi-VN' },
        zh: { name: 'Chinese', native: '中文', flag: '🇨🇳', dir: 'ltr', speech: 'zh-CN' }
    });


    /*
     * ----------------------------------------------------------
     * CANONICAL LANGUAGE ORDER
     * ----------------------------------------------------------
     */

    const LANGUAGE_ORDER = Object.freeze([
        'ar',
        'en',
        'fr',
        'ber',
        'ku',
        'ckb',
        'am',
        'az',
        'bg',
        'bn',
        'cs',
        'da',
        'de',
        'el',
        'es',
        'et',
        'fa',
        'fi',
        'ga',
        'ha',
        'hi',
        'hr',
        'hu',
        'id',
        'it',
        'ja',
        'ka',
        'kk',
        'ko',
        'lt',
        'lv',
        'ms',
        'mt',
        'my',
        'nl',
        'no',
        'pa',
        'pl',
        'prs',
        'ps',
        'pt',
        'qu',
        'ro',
        'ru',
        'si',
        'sk',
        'sl',
        'sv',
        'sw',
        'th',
        'tl',
        'tr',
        'uk',
        'ur',
        'uz',
        'vi',
        'zh'
    ]);


    /*
     * ----------------------------------------------------------
     * RUNTIME STATE
     * ----------------------------------------------------------
     */

    const loadedLocales = {
        ar: I18N.ar,
        en: I18N.en,
        fr: I18N.fr
    };

    const loading = Object.create(null);

    let currentLang = 'ar';


    /*
     * ----------------------------------------------------------
     * TRANSLATION FUNCTION
     * ----------------------------------------------------------
     *
     * Fallback hierarchy:
     *
     * 1. Current language
     * 2. Canonical English Master
     * 3. Arabic base
     * 4. Explicit fallback
     * 5. Key itself
     *
     * This guarantees that a missing translation never produces
     * a completely blank interface.
     * ----------------------------------------------------------
     */

    function t(key, fallback) {

        if (!key) {
            return fallback ?? '';
        }

        const lang = loadedLocales[currentLang] || {};

        if (currentLang === 'ar') {
            return (
                lang[key] ??
                I18N.ar[key] ??
                fallback ??
                I18N.en[key] ??
                key
            );
        }

        return (
            lang[key] ??
            I18N.en[key] ??
            fallback ??
            I18N.ar[key] ??
            key
        );
    }


    /*
     * ----------------------------------------------------------
     * REPORT / LEGACY KEY COMPATIBILITY
     * ----------------------------------------------------------
     *
     * These aliases preserve compatibility with older report
     * components while the platform gradually moves toward the
     * Canonical Master terminology.
     *
     * They do NOT alter the Canonical English Master.
     * ----------------------------------------------------------
     */

    const REPORT_KEY_ALIASES = Object.freeze({

        report_student_name: 'genius_full_name_label',
        report_student_code: 'genius_code_label',

        report_score: 'score_label',
        report_accuracy: 'accuracy_metric',
        report_duration: 'duration_label',
        report_speed: 'speed_label',

        report_training_mode: 'mode_label',
        report_preset: 'preset_kyu_dan_label',

        report_development: 'growth_metric',

        report_print_pdf: 'reports_label',
        report_back_history: 'nav_history',

        report_accuracy_change: 'accuracy_metric',
        report_speed_improved: 'perf_metric',
        report_time_increased: 'duration_label',
        report_time: 'duration_label',
        report_time_unchanged: 'duration_label',

        report_undefined: 'student_not_found',

        report_student_data: 'nav_history',
        report_basic_metrics: 'accuracy_metric',
        report_challenge_settings: 'level_label',

        report_previous: 'reports_label',
        report_previous_date: 'loading_data',

        report_title: 'reports_label',
        report_generated: 'loading_data'
    });


    function translateReportKey(key, fallback) {

        const alias = REPORT_KEY_ALIASES[key];

        if (!alias) {
            return null;
        }

        return t(alias, fallback);
    }


    /*
     * ----------------------------------------------------------
     * DYNAMIC VALUE TRANSLATION
     * ----------------------------------------------------------
     *
     * Used by dynamic challenge/report UI values.
     * ----------------------------------------------------------
     */

    const DYNAMIC_VALUE_KEYS = Object.freeze({

        flash: 'mode_flash_short',
        'flash anzan': 'mode_flash_short',

        standard: 'mode_standard_short',
        'standard soroban': 'mode_standard_short',

        addition: 'op_add_short',
        add: 'op_add_short',

        subtraction: 'op_sub_short',
        subtract: 'op_sub_short',

        mixed: 'op_mix_short',
        mix: 'op_mix_short',

        l1: 'level_l1',
        l2: 'level_l2',
        l3: 'level_l3',
        lm: 'level_lm',

        under_6: 'age_under_6',
        '7_9': 'age_7_9',
        '10_12': 'age_10_12',
        '13_15': 'age_13_15',
        '16_plus': 'age_16_plus',

        challenge: 'mode_label',
        anzan: 'mode_flash'
    });


    function dynamicValueKey(raw) {

        if (raw == null) {
            return null;
        }

        const value = String(raw).trim().toLowerCase();

        return DYNAMIC_VALUE_KEYS[value] || null;
    }


    function translateDynamicValue(raw, fallback) {

        const key = dynamicValueKey(raw);

        if (!key) {
            return fallback ?? raw;
        }

        return t(key, fallback ?? raw);
    }


    /*
     * ----------------------------------------------------------
     * APPLY TRANSLATIONS
     * ----------------------------------------------------------
     */

    function applyTranslations() {

        const meta =
            LANGUAGE_META[currentLang] ||
            LANGUAGE_META.ar;

        const html = document.documentElement;

        html.lang = currentLang;
        html.dir = meta.dir;

        const title =
            t('brand_title', 'MIZAN ANZAN');

        document.title = title;

        const desc =
            document.querySelector('meta[name="description"]');

        if (desc) {
            desc.content =
                t('meta_description', desc.content);
        }


        /*
         * Standard text nodes
         */

        document
            .querySelectorAll('[data-i18n]')
            .forEach(el => {

                const key =
                    el.getAttribute('data-i18n');

                const value =
                    t(key);

                if (value != null) {
                    el.textContent = value;
                }
            });


        /*
         * Placeholders
         */

        document
            .querySelectorAll('[data-i18n-ph]')
            .forEach(el => {

                const key =
                    el.getAttribute('data-i18n-ph');

                el.placeholder =
                    t(key, el.placeholder);
            });


        /*
         * ARIA labels
         */

        document
            .querySelectorAll('[data-i18n-aria]')
            .forEach(el => {

                const key =
                    el.getAttribute('data-i18n-aria');

                el.setAttribute(
                    'aria-label',
                    t(
                        key,
                        el.getAttribute('aria-label')
                    )
                );
            });


        /*
         * Current language label
         */

        const label =
            document.getElementById(
                'current-lang-label'
            );

        if (label) {

            label.textContent =
                `${meta.flag} ${meta.native}`;

            label.setAttribute(
                'lang',
                currentLang
            );

            label.setAttribute(
                'dir',
                meta.dir
            );
        }


        /*
         * Legacy language button
         */

        const oldBtn =
            document.getElementById('lang-btn');

        if (oldBtn) {

            oldBtn.textContent =
                `${meta.flag} ${meta.native}`;

            oldBtn.setAttribute(
                'aria-label',
                t(
                    'language_selector_aria',
                    'Language selection'
                )
            );
        }


        /*
         * Allow application-specific dynamic UI
         * to refresh itself after language change.
         */

        if (
            typeof global.refreshDynamicTranslations ===
            'function'
        ) {
            global.refreshDynamicTranslations();
        }
    }


    /*
     * ----------------------------------------------------------
     * LOAD EXTERNAL LOCALE
     * ----------------------------------------------------------
     *
     * English is already embedded and therefore never needs
     * to be downloaded.
     *
     * Arabic and French are also embedded.
     *
     * All future languages are dynamically loaded.
     * ----------------------------------------------------------
     */

    const CANONICAL_KEYS = Object.freeze(Object.keys(I18N.en));
    const CANONICAL_KEY_SET = new Set(CANONICAL_KEYS);

    function validateLocaleShape(lang, data) {

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Locale ' + lang + ' did not provide a valid object.');
        }

        const localeKeys = Object.keys(data);
        const missing = CANONICAL_KEYS.filter(
            key => !Object.prototype.hasOwnProperty.call(data, key)
        );
        const extra = localeKeys.filter(
            key => !CANONICAL_KEY_SET.has(key)
        );

        if (missing.length || extra.length) {
            const parts = [];

            if (missing.length) {
                parts.push('missing: ' + missing.join(', '));
            }

            if (extra.length) {
                parts.push('extra: ' + extra.join(', '));
            }

            throw new Error(
                'Locale ' + lang + ' does not exactly match the Canonical English Master (' +
                CANONICAL_KEYS.length + ' keys). ' +
                parts.join(' | ')
            );
        }

        return true;
    }

    function loadLocale(lang) {

        if (!LANGUAGE_META[lang]) {
            return Promise.reject(
                new Error('Unsupported language: ' + lang)
            );
        }

        if (loadedLocales[lang]) {
            return Promise.resolve(loadedLocales[lang]);
        }

        if (loading[lang]) {
            return loading[lang];
        }

        loading[lang] = new Promise((resolve, reject) => {

            const script = document.createElement('script');

            script.src =
                `/mizan_anzan/assets/js/locales/${lang}.js?v=20260820-global-final-r1`;

            script.async = true;

            const cleanup = () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                delete loading[lang];
            };

            script.onload = () => {

                try {
                    const data =
                        (global.MizanLocales && global.MizanLocales[lang]) ||
                        (global.I18nLocales && global.I18nLocales[lang]);

                    if (!data) {
                        throw new Error(
                            'Locale loaded but did not register: ' + lang
                        );
                    }

                    validateLocaleShape(lang, data);

                    loadedLocales[lang] = Object.freeze(
                        Object.assign({}, data)
                    );

                    cleanup();
                    resolve(loadedLocales[lang]);

                } catch (err) {
                    cleanup();
                    reject(err);
                }
            };

            script.onerror = () => {
                cleanup();
                reject(
                    new Error('Locale file failed: ' + lang)
                );
            };

            document.head.appendChild(script);
        });

        return loading[lang];
    }


    /*
     * ----------------------------------------------------------
     * SET LANGUAGE
     * ----------------------------------------------------------
     */

    let languageChangeSequence = 0;

    async function setLanguage(lang) {

        if (!LANGUAGE_META[lang]) {
            return false;
        }

        const requestId = ++languageChangeSequence;

        try {
            await loadLocale(lang);

            /*
             * If another language was requested while this one was
             * loading, this result is stale and must not overwrite
             * the user's latest choice.
             */
            if (requestId !== languageChangeSequence) {
                return false;
            }

            currentLang = lang;

            if (global.AppState) {
                global.AppState.lang = lang;
            }

            try {
                localStorage.setItem('mizan_anzan_lang', lang);
                localStorage.setItem('mizan_lang', lang);

                document.cookie =
                    `mizan_anzan_lang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax`;
            } catch (_) {}

            applyTranslations();
            buildLanguageDropdown();

            global.dispatchEvent(
                new CustomEvent(
                    'mizanLanguageChanged',
                    {
                        detail: {
                            lang,
                            dir: LANGUAGE_META[lang].dir,
                            speech: LANGUAGE_META[lang].speech
                        }
                    }
                )
            );

            return true;

        } catch (err) {

            console.error(
                '[MIZAN ANZAN] Language load failed:',
                lang,
                err
            );

            return false;
        }
    }


    /*
     * ----------------------------------------------------------
     * LANGUAGE MENU HELPERS
     * ----------------------------------------------------------
     */

    function getLanguageMenu(preferredId) {

        if (preferredId) {
            const preferred = document.getElementById(preferredId);
            if (preferred) return preferred;
        }

        return (
            document.getElementById('language-menu') ||
            document.getElementById('language-dropdown-menu')
        );
    }

    function getLanguageButton(menuId) {

        if (menuId === 'registration-language-menu') {
            return document.getElementById('registration-lang-btn');
        }

        return (
            document.getElementById('language-dropdown-btn') ||
            document.getElementById('lang-btn')
        );
    }

    function updateLanguageMenuPlacement(menuOrId) {

        const menu =
            typeof menuOrId === 'string'
                ? getLanguageMenu(menuOrId)
                : (menuOrId || getLanguageMenu());

        if (!menu) return;

        const btn = getLanguageButton(menu.id);

        if (!btn) return;

        const picker = btn.closest(
            '.mizan-language-picker, #language-dropdown-container'
        );

        const vw = Math.max(
            document.documentElement.clientWidth || 0,
            window.innerWidth || 0
        );

        const vh = Math.max(
            document.documentElement.clientHeight || 0,
            window.innerHeight || 0
        );

        const rect = btn.getBoundingClientRect();
        const mobile = vw <= 700;
        const margin = mobile ? 8 : 12;

        const menuWidth = mobile
            ? Math.min(360, Math.max(240, vw - margin * 2))
            : Math.min(520, Math.max(360, vw - margin * 2));

        const menuMaxHeight = Math.min(
            mobile ? 560 : 620,
            Math.max(220, vh - 24)
        );

        menu.style.position = 'fixed';
        menu.style.width = `${menuWidth}px`;
        menu.style.maxWidth = `calc(100vw - ${margin * 2}px)`;
        menu.style.maxHeight = `${menuMaxHeight}px`;
        menu.style.zIndex = '2147483000';
        menu.style.boxSizing = 'border-box';
        menu.style.insetInline = 'auto';
        menu.style.left = 'auto';
        menu.style.right = 'auto';
        menu.style.top = 'auto';
        menu.style.bottom = 'auto';

        if (mobile) {
            const left = Math.max(
                margin,
                Math.round((vw - menuWidth) / 2)
            );

            let top = Math.round(rect.bottom + 6);

            if (top + menuMaxHeight > vh - margin) {
                top = Math.max(
                    margin,
                    Math.round(vh - menuMaxHeight - margin)
                );
            }

            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;

        } else {
            const opensRight =
                (vw - rect.right) >= menuWidth + margin;

            const left = opensRight
                ? rect.right - menuWidth
                : rect.left;

            const clampedLeft = Math.min(
                Math.max(margin, Math.round(left)),
                Math.max(margin, vw - menuWidth - margin)
            );

            const below = rect.bottom + 8;
            const above = rect.top - menuMaxHeight - 8;

            const top =
                below + menuMaxHeight <= vh - margin || above < margin
                    ? below
                    : above;

            menu.style.left = `${clampedLeft}px`;
            menu.style.top = `${Math.max(margin, Math.round(top))}px`;

            if (picker) {
                picker.classList.toggle('menu-left', !opensRight);
                picker.classList.toggle('menu-right', opensRight);
            }
        }
    }

    function populateLanguageMenu(menu) {

        if (!menu) return;

        menu.innerHTML = '';
        menu.classList.add('mizan-language-menu');

        LANGUAGE_ORDER.forEach(code => {

            const meta = LANGUAGE_META[code];
            if (!meta) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className =
                'mizan-language-option' +
                (code === currentLang ? ' is-active' : '');
            button.dataset.lang = code;
            button.dir = meta.dir;
            button.setAttribute(
                'aria-label',
                `${meta.native} — ${code.toUpperCase()}`
            );
            button.title = `${meta.native} — ${code.toUpperCase()}`;

            button.innerHTML = `
                <span class="mizan-language-main">
                    <span class="mizan-language-flag" aria-hidden="true">${meta.flag}</span>
                    <span class="mizan-language-name">${meta.native}</span>
                </span>
                <span class="mizan-language-code" aria-hidden="true">${code.toUpperCase()}</span>
                <span class="mizan-language-check" aria-hidden="true">✓</span>
            `;

            button.addEventListener('click', () => {
                menu.classList.remove('is-open');
                const btn = getLanguageButton(menu.id);
                if (btn) btn.setAttribute('aria-expanded', 'false');
                void setLanguage(code);
            });

            menu.appendChild(button);
        });

        updateLanguageMenuPlacement(menu);
    }

    function buildLanguageDropdown() {

        const menuIds = [
            'language-menu',
            'language-dropdown-menu',
            'registration-language-menu'
        ];

        menuIds.forEach(id => {
            const menu = document.getElementById(id);
            if (menu) populateLanguageMenu(menu);
        });

        applyTranslations();
    }

    function toggleLanguageDropdown(menuId) {

        const menu = getLanguageMenu(menuId);
        if (!menu) return;

        const btn = getLanguageButton(menu.id);
        const open = !menu.classList.contains('is-open');

        /* Close other language menus first. */
        document
            .querySelectorAll('.mizan-language-menu.is-open')
            .forEach(other => {
                if (other !== menu) {
                    other.classList.remove('is-open');
                    const otherBtn = getLanguageButton(other.id);
                    if (otherBtn) {
                        otherBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });

        menu.classList.toggle('is-open', open);
        menu.classList.remove('hidden');

        if (btn) {
            btn.setAttribute('aria-expanded', String(open));
        }

        if (open) {
            requestAnimationFrame(() => {
                updateLanguageMenuPlacement(menu);
            });
        }
    }


    /*
     * ----------------------------------------------------------
     * INITIALIZATION
     * ----------------------------------------------------------
     */

    async function init() {

        let saved = null;


        try {

            saved =
                localStorage.getItem(
                    'mizan_anzan_lang'
                ) ||
                localStorage.getItem(
                    'mizan_lang'
                );

        } catch (_) {}


        /*
         * Arabic is the mandatory first-visit default.
         * Browser language is deliberately NOT used here: the
         * platform's first experience must remain Arabic unless
         * the user has explicitly saved another language.
         */
        const preferred =
            LANGUAGE_META[saved]
                ? saved
                : 'ar';


        /*
         * Load external locale only when necessary.
         *
         * English does NOT make a network request because
         * the Canonical English Master is embedded.
         */

        await loadLocale(
            preferred
        ).catch(err => {

            console.warn(
                '[MIZAN ANZAN] Preferred locale unavailable, using Arabic:',
                preferred,
                err
            );

        });


        currentLang =
            loadedLocales[preferred]
                ? preferred
                : 'ar';


        /*
         * Synchronize application state.
         */

        if (global.AppState) {

            global.AppState.lang =
                currentLang;
        }


        applyTranslations();

        buildLanguageDropdown();
    }


    /*
     * ----------------------------------------------------------
     * GLOBAL API
     * ----------------------------------------------------------
     */

    global.I18n =
        Object.freeze({

            AVAILABLE_LANGUAGES:
                LANGUAGE_META,

            LANGUAGE_ORDER,

            currentLang:
                () => currentLang,

            getLang:
                () => currentLang,

            t,

            translate:
                t,

            translateReportKey,

            translateDynamicValue,

            dynamicValueKey,

            setLanguage,

            switchLanguage:
                setLanguage,

            loadLocale,

            init,

            applyTranslations,

            buildLanguageDropdown,

            toggleLanguageDropdown,

            getSpeechLocale:
                () =>
                    LANGUAGE_META[
                        currentLang
                    ].speech,

            getDirection:
                () =>
                    LANGUAGE_META[
                        currentLang
                    ].dir
        });


    /*
     * ----------------------------------------------------------
     * LEGACY / GLOBAL COMPATIBILITY
     * ----------------------------------------------------------
     */

    global.MizanI18n = {

        locales:
            LANGUAGE_ORDER,

        meta:
            LANGUAGE_META,

        t,

        translate:
            t,

        apply:
            setLanguage,

        init,

        buildLanguageDropdown,

        translateReportKey,

        translateDynamicValue
    };


    global.t =
        t;

    global.translateText =
        t;

    global.translateReportKey =
        translateReportKey;

    global.translateDynamicValue =
        translateDynamicValue;

    global.toggleLanguageDropdown =
        toggleLanguageDropdown;

    /*
     * Keep legacy public function name.
     */

    global.toggleLanguage =
        toggleLanguageDropdown;

    global.setMizanLanguage =
        setLanguage;


    /*
     * ----------------------------------------------------------
     * RESPONSIVE LANGUAGE MENU
     * ----------------------------------------------------------
     */

    window.addEventListener(
        'resize',
        () => {
            document
                .querySelectorAll('.mizan-language-menu.is-open')
                .forEach(menu => updateLanguageMenuPlacement(menu));
        },
        { passive: true }
    );


    /*
     * ----------------------------------------------------------
     * START
     * ----------------------------------------------------------
     */

    document.addEventListener(
        'DOMContentLoaded',
        () => {

            void init();

        }
    );

})(window);