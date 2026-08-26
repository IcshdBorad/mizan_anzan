/**
 * ميزان أنزان
 * Genius Profile Frontend
 *
 * المسار:
 * /public_html/mizan_anzan/js/anzan_profile.js
 */

'use strict';


const AnzanProfile = (() => {

    const API_URL = 'api/anzan_profile.php';


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    function getElement(id) {
        return document.getElementById(id);
    }


    function setText(id, value) {

        const element = getElement(id);

        if (!element) {
            return;
        }

        element.textContent = value;
    }


    function setProgress(id, value) {

        const element = getElement(id);

        if (!element) {
            return;
        }

        const safeValue = Math.max(
            0,
            Math.min(100, Number(value) || 0)
        );

        element.style.width = `${safeValue}%`;

        element.setAttribute(
            'aria-valuenow',
            String(safeValue)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | تحميل الملف
    |--------------------------------------------------------------------------
    */

    async function load(anzId) {

        if (!anzId) {
            showError('لم يتم تحديد ANZ ID.');
            return;
        }


        try {

            showLoading();


            const url =
                `${API_URL}?anz_id=${encodeURIComponent(anzId)}`;


            const response =
                await fetch(
                    url,
                    {
                        method: 'GET',
                        headers: {
                            'Accept':
                                'application/json'
                        },
                        cache: 'no-store'
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    'تعذر تحميل الملف.'
                );
            }


            render(data.profile, data.analytics);


        } catch (error) {

            console.error(
                'Anzan Profile:',
                error
            );

            showError(
                error.message ||
                'حدث خطأ أثناء تحميل ملف العبقري.'
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | عرض البيانات
    |--------------------------------------------------------------------------
    */

    function render(profile, analytics) {

        setText(
            'anzanProfileName',
            profile.full_name || 'عبقري أنزان'
        );


        setText(
            'anzanProfileId',
            profile.anz_id
        );


        setText(
            'anzanProfileLevel',
            profile.level || 'L1'
        );


        setText(
            'anzanProfileRank',
            profile.rank_name || 'Kyu'
        );


        setText(
            'anzanIndex',
            Number(profile.anzan_index || 0)
                .toFixed(1)
        );


        setText(
            'focusScore',
            `${Math.round(profile.focus_score || 0)}%`
        );


        setText(
            'accuracyScore',
            `${Math.round(profile.accuracy_score || 0)}%`
        );


        setText(
            'speedScore',
            `${Math.round(profile.speed_score || 0)}%`
        );


        setText(
            'developmentScore',
            `${Math.round(profile.development_score || 0)}%`
        );


        setText(
            'consistencyScore',
            `${Math.round(profile.consistency_score || 0)}%`
        );


        setText(
            'totalSessions',
            profile.total_sessions || 0
        );


        setText(
            'totalQuestions',
            profile.total_questions || 0
        );


        setText(
            'currentStreak',
            profile.current_streak || 0
        );


        setText(
            'recommendation',
            analytics &&
            analytics.recommendation
                ? analytics.recommendation
                : 'استمر في التدريب.'
        );


        setProgress(
            'focusProgress',
            profile.focus_score
        );


        setProgress(
            'accuracyProgress',
            profile.accuracy_score
        );


        setProgress(
            'speedProgress',
            profile.speed_score
        );


        setProgress(
            'developmentProgress',
            profile.development_score
        );


        setProgress(
            'consistencyProgress',
            profile.consistency_score
        );


        hideLoading();
    }


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    function showLoading() {

        document.body.classList.add(
            'anzan-profile-loading'
        );
    }


    function hideLoading() {

        document.body.classList.remove(
            'anzan-profile-loading'
        );
    }


    function showError(message) {

        hideLoading();

        const box =
            getElement('anzanProfileError');

        if (!box) {
            return;
        }

        box.textContent = message;

        box.hidden = false;
    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {
        load
    };

})();


/*
|--------------------------------------------------------------------------
| التشغيل
|--------------------------------------------------------------------------
*/

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const profileRoot =
            document.querySelector(
                '[data-anz-id]'
            );


        if (!profileRoot) {
            return;
        }


        const anzId =
            profileRoot.dataset.anzId;


        if (!anzId) {
            return;
        }


        AnzanProfile.load(anzId);
    }
);