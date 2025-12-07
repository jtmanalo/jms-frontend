import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children, user }) => {
    const [branchName, setBranchName] = useState(null);
    const [branchLocation, setBranchLocation] = useState(null);
    const [actualBranchId, setActualBranchId] = useState(null);
    const [shiftId, setShiftId] = useState(null);

    const fetchActiveShift = useCallback(async () => {
        if (!user?.userID) return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`
            );

            if (response.error) {
                alert(response.error);
                return;
            }

            const shiftData = response.data && response.data[0];
            if (shiftData) {
                const { BranchID, ShiftID, Name, Location } = shiftData;
                setActualBranchId(BranchID);
                setShiftId(ShiftID);
                setBranchName(Name);
                setBranchLocation(Location);
            } else {
                console.warn('No active shift data found.');
            }
        } catch (error) {
            console.error('Error fetching active shift:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchActiveShift();
    }, [fetchActiveShift]);

    return (
        <DashboardContext.Provider value={{
            branchName,
            setBranchName,
            branchLocation,
            setBranchLocation,
            actualBranchId,
            shiftId,
            fetchActiveShift
        }}>
            {children}
        </DashboardContext.Provider>
    );
};