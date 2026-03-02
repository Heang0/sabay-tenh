import React from 'react';

const Skeleton = ({ className, variant = 'box' }) => {
    const baseClass = "animate-pulse bg-gray-200";

    if (variant === 'circle') {
        return <div className={`${baseClass} rounded-full ${className}`} />;
    }

    return <div className={`${baseClass} rounded-md ${className}`} />;
};

export const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        {/* Image Placeholder */}
        <Skeleton className="pb-[100%] w-full" />

        {/* Content Placeholder */}
        <div className="p-3 space-y-2 flex-grow">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center justify-between mt-auto pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton variant="circle" className="w-8 h-8" />
            </div>
        </div>
    </div>
);

export const CategorySkeleton = () => (
    <Skeleton className="h-10 w-24 rounded-full" />
);

export default Skeleton;
