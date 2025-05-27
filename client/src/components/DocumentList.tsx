import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface Document {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
}

const DocumentList = ({ documents, onDelete }: DocumentListProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Uploaded Documents</h4>
        <span className="text-xs text-gray-500">{documents.length} files</span>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center">
                  <i className={`${doc.type === 'certificate' ? 'ri-file-text-line' : 'ri-file-lock-line'} text-gray-500 mr-3`}></i>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(doc.size / 1024)} KB • Uploaded {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
            
            {documents.length === 0 && (
              <li className="py-6 px-4 text-center">
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentList;
