import React from 'react'

export default function Pagination() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors duration-150"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous    
          </button>
          <button
            type="button"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors duration-150"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
