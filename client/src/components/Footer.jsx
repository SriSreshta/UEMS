import React from "react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-center items-center text-center">
                    <div className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} UEMS (University Enrollment Management System). All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
