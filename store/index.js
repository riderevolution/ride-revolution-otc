import Vuex from 'vuex'

const createStore = () => {
    return new Vuex.Store({
        state: () => ({
            onlineAttendancePackage: false,
            onlineAttendanceCustomer: false,
            refundSuccessStatus: false,
            refundConfirmStatus: false,
            refundStatus: false,
            onlineAttendancePrompt: false,
            onlineAttendanceLayoutStatus: false,
            editPackageExpiryStatus: false,
            redeemGiftCardSuccessStatus: false,
            redeemGiftCardStatus: false,
            packageLayoutStatus: false,
            attendanceLayoutStatus: false,
            dashboardAttendanceStatus: false,
            classScheduleLayoutStatus: false,
            calendarAvailabilityUnmarkedStatus: false,
            calendarAvailabilityMarkedStatus: false,
            calendarAvailabilityActionStatus: false,
            calendarAvailabilityPartiallyPromptStatus: false,
            calendarAvailabilityPromptStatus: false,
            calendarAvailabilitySuccessStatus: false,
            packageActionValidateStatus: false,
            packageActionPromptStatus: false,
            packageActionStatus: false,
            bookerMenuPromptStatus: false,
            studioChangerPromptStatus: false,
            schedulerRepeatPromptStatus: false,
            promptBrokenBikeStatus: false,
            promptQuickSaleStatus: false,
            errorQuickSaleStatus: false,
            upcomingClassesLayoutStatus: false,
            customerPromptStatus: false,
            pendingTransactionsStatus: false,
            disableBookerUI: false,
            pendingCustomerID: 0,
            waitlistID: 0,
            userPackageCountId: 0,
            compID: 0,
            bookingID: 0,
            scheduleID: 0,
            seat: '',
            customerPackageStatus: false,
            removeAssignStatus: false,
            assignStatus: false,
            changeStudioStatus: false,
            calendarDuplicateStatus: false,
            calendarClearStatus: false,
            customerCreditQuickSaleStatus: false,
            customerProductQuickSaleStatus: false,
            customerPendingQuickSaleStatus: false,
            quickSaleStatus: false,
            successfulStatus: false,
            successfulLaterStatus: false,
            promptWaitlistStatus: false,
            promptPromoStatus: false,
            promptCancelStatus: false,
            promptSwitchSeatStatus: false,
            promptSignOutStatus: false,
            promptBookerStatus: false,
            promptBookerActionStatus: false,
            promptValidateStatus: false,
            promptStatus: false,
            importStatus: false,
            resetSuccessfulStatus: false,
            resetStatus: false,
            deleteStatus: false,
            deleteImageStatus: false,
            errorOverlayStatus: false,
            errorStatus: false,
            errorList: [],
            confirmStatus: false,
            variantImageForm: false,
            categoryForm: false,
            userForm: false,
            roleForm: false,
            hiddenMobile: true,
            isAuth: false,
            isNotify: false,
            notificationMessage: '',
            isDeleteShow: false,
            contentLoaded: false,
            isLoading: false,
            token: '',
            customerID: 0,
            customerStoreCredit: 0,
            customer: null,
            user: {
                first_name: '',
                current_studio_id: '',
                staff_details: {
                    studio_access: [
                        {
                            studio: {}
                        }
                    ],
                    role: {
                        display_name: '',
                    }
                },
                instructor_details: {}
            }
        })
    })
}

export default createStore
