import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, Shield, Zap, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shadcn UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
  orderCount: number;
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  fileInfo: FileInfo | null;
  onClearData: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isLoading,
  error,
  fileInfo,
  onClearData,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: false,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDropAccepted: () => setDragOver(false),
    onDropRejected: () => setDragOver(false),
  });

  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data never leaves your browser",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get insights in seconds",
    },
    {
      icon: Eye,
      title: "Deep Insights",
      description: "Discover hidden patterns",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8"
      >
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Spenddy
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your Swiggy order history into actionable insights and
            discover your food ordering patterns
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            100% Private
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            No Server Required
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Instant Results
          </Badge>
        </div>
      </motion.div>

      {/* File Status Section */}
      {fileInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-700 dark:text-green-400">
                      Data Loaded: {fileInfo.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{fileInfo.orderCount.toLocaleString()} orders</span>
                      <span>•</span>
                      <span>
                        {(fileInfo.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span>•</span>
                      <span>
                        Uploaded{" "}
                        {new Date(fileInfo.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-500/30"
                  >
                    Cached
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearData}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Clear Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group",
                {
                  "border-orange-500 bg-orange-500/10 scale-105":
                    isDragActive || dragOver,
                  "border-muted-foreground/25 hover:border-orange-400 hover:bg-orange-500/5":
                    !isLoading && !isDragActive,
                  "border-muted-foreground/10 cursor-not-allowed opacity-50":
                    isLoading,
                }
              )}
            >
              <input {...getInputProps()} disabled={isLoading} />

              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
                    />
                    <Progress value={75} className="w-48 mx-auto" />
                  </div>
                ) : (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">
                    {isLoading
                      ? "Processing your data..."
                      : "Upload your Swiggy data"}
                  </h3>

                  <p className="text-muted-foreground text-lg">
                    {isLoading ? (
                      "Analyzing your order history and generating insights"
                    ) : isDragActive ? (
                      "Drop your JSON file here"
                    ) : (
                      <>
                        Drag & drop your{" "}
                        <code className="bg-muted px-2 py-1 rounded text-orange-500 font-mono text-sm">
                          allOrders.json
                        </code>{" "}
                        file here, or click to browse
                      </>
                    )}
                  </p>
                </div>

                {!isLoading && (
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>JSON files only</span>
                    </div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <span>Max 50MB</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6"
              >
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-destructive mb-1">
                          Upload Failed
                        </h4>
                        <p className="text-destructive/80 text-sm">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Card className="text-center h-full group hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 border rounded-2xl flex items-center justify-center mx-auto group-hover:border-orange-500/50 transition-all duration-300">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">
                How to get your Swiggy data
              </h2>
              <p className="text-lg text-muted-foreground">Coming Soon!</p>
              <p className="text-sm text-muted-foreground">
                We're working on detailed instructions to help you get your
                Swiggy data.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-500">
                  Your Privacy is Protected
                </h3>
                <p className="text-sm text-muted-foreground">
                  All data processing happens locally in your browser. We don't
                  store, transmit, or have access to your personal information.
                  Your Swiggy data never leaves your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FileUpload; 