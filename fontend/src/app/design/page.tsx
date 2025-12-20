'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, Type, Image as ImageIcon, RotateCcw, RotateCw, 
  Trash2, Download, Send, Save, ZoomIn, ZoomOut, 
  Move, Smartphone, ChevronLeft, ChevronRight, Palette,
  AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline,
  Layers, Eye, EyeOff, Copy, FlipHorizontal, FlipVertical,
  Undo, Redo, Grid, Lock, Unlock, Home
} from 'lucide-react';
import { Canvas as FabricCanvas, FabricImage, FabricText, Rect, Circle, IText } from 'fabric';
import { useAuth } from '@/contexts/AuthContext';
import { getPhoneTemplates, createDesign, updateDesign, submitDesign } from '@/lib/api-client';

// Types
interface PhoneTemplate {
  template_id: number;
  phone_model: string;
  brand: string;
  template_image_url: string;
  print_width_mm: number;
  print_height_mm: number;
  canvas_width: number;
  canvas_height: number;
  is_active: boolean;
}

interface DesignState {
  designId: number | null;
  phoneModel: string;
  templateId: number | null;
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
}

export default function DesignPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [templates, setTemplates] = useState<PhoneTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PhoneTemplate | null>(null);
  const [designState, setDesignState] = useState<DesignState>({
    designId: null,
    phoneModel: '',
    templateId: null,
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'shapes' | 'layers'>('upload');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(0.4);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Text settings
  const [textSettings, setTextSettings] = useState({
    text: 'Nhập text',
    fontFamily: 'Arial',
    fontSize: 40,
    fill: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    underline: false
  });
  
  // Guest info (for non-logged in users)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await getPhoneTemplates();
        console.log('API Response:', response);
        
        // Handle response format { data, error } from backend
        let templatesData = response;
        if (response?.data) {
          templatesData = response.data;
        }
        
        if (templatesData && Array.isArray(templatesData) && templatesData.length > 0) {
          setTemplates(templatesData);
        } else {
          console.warn('No templates found in API response');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);
  
  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedTemplate || fabricRef.current) return;
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: selectedTemplate.canvas_width,
      height: selectedTemplate.canvas_height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });
    
    fabricRef.current = canvas;
    
    // Event listeners
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });
    
    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });
    
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });
    
    canvas.on('object:modified', () => {
      saveToHistory();
    });
    
    // Add phone template overlay
    addTemplateOverlay(canvas, selectedTemplate);
    
    // Initial zoom
    updateZoom(0.4);
    
    // Save initial state
    saveToHistory();
    
    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [selectedTemplate]);
  
  // Add template overlay (phone frame)
  const addTemplateOverlay = async (canvas: FabricCanvas, template: PhoneTemplate) => {
    const cw = template.canvas_width;
    const ch = template.canvas_height;
    
    // Load template image if available
    if (template.template_image_url) {
      try {
        const img = await FabricImage.fromURL(template.template_image_url, { crossOrigin: 'anonymous' });
        // Scale to fit canvas while maintaining aspect ratio
        const scale = Math.min(cw / (img.width || cw), ch / (img.height || ch)) * 0.9;
        img.scale(scale);
        img.set({
          left: cw / 2,
          top: ch / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          opacity: 0.3,
          name: 'phoneFrame'
        });
        canvas.add(img);
        canvas.sendObjectToBack(img);
      } catch (e) {
        console.log('Could not load template image');
      }
    }
    
    // Calculate safe print area (with padding for phone edges)
    const paddingX = cw * 0.05; // 5% padding on each side
    const paddingTop = ch * 0.08; // 8% padding top (for camera notch)
    const paddingBottom = ch * 0.05; // 5% padding bottom
    
    // Create safe area indicator
    const safeAreaRect = new Rect({
      left: paddingX,
      top: paddingTop,
      width: cw - (paddingX * 2),
      height: ch - paddingTop - paddingBottom,
      fill: 'transparent',
      stroke: '#e91e63',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      selectable: false,
      evented: false,
      name: 'safeArea'
    });
    
    canvas.add(safeAreaRect);
    
    // Add camera notch indicator for iPhones
    if (template.phone_model.toLowerCase().includes('iphone')) {
      const notchWidth = cw * 0.3;
      const notchHeight = ch * 0.03;
      const notch = new Rect({
        left: (cw - notchWidth) / 2,
        top: 10,
        width: notchWidth,
        height: notchHeight,
        fill: '#00000020',
        rx: notchHeight / 2,
        ry: notchHeight / 2,
        selectable: false,
        evented: false,
        name: 'phoneFrame'
      });
      canvas.add(notch);
    }
    
    // Add phone model label
    const label = new FabricText(template.phone_model, {
      left: cw / 2,
      top: ch * 0.04,
      fontSize: 20,
      fill: '#999999',
      fontFamily: 'Arial',
      originX: 'center',
      selectable: false,
      evented: false,
      name: 'phoneLabel'
    });
    
    canvas.add(label);
    
    // Add size info label
    const sizeLabel = new FabricText(`${template.print_width_mm} × ${template.print_height_mm} mm`, {
      left: cw / 2,
      top: ch - 25,
      fontSize: 14,
      fill: '#cccccc',
      fontFamily: 'Arial',
      originX: 'center',
      selectable: false,
      evented: false,
      name: 'phoneLabel'
    });
    
    canvas.add(sizeLabel);
    canvas.renderAll();
  };
  
  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    if (!fabricRef.current) return;
    
    const json = JSON.stringify(fabricRef.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Undo
  const undo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);
  
  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);
  
  // Update zoom
  const updateZoom = (newZoom: number) => {
    if (!fabricRef.current || !containerRef.current) return;
    
    const clampedZoom = Math.max(0.1, Math.min(2, newZoom));
    setZoom(clampedZoom);
    
    fabricRef.current.setZoom(clampedZoom);
    fabricRef.current.setDimensions({
      width: (selectedTemplate?.canvas_width || 700) * clampedZoom,
      height: (selectedTemplate?.canvas_height || 1500) * clampedZoom
    });
    fabricRef.current.renderAll();
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !fabricRef.current) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imgUrl = event.target?.result as string;
        
        try {
          const img = await FabricImage.fromURL(imgUrl, { crossOrigin: 'anonymous' });
          
          // Scale image to fit canvas
          const canvas = fabricRef.current!;
          const maxWidth = canvas.width! * 0.8;
          const maxHeight = canvas.height! * 0.5;
          
          const scale = Math.min(
            maxWidth / (img.width || 100),
            maxHeight / (img.height || 100)
          );
          
          img.scale(scale);
          img.set({
            left: (canvas.width! / 2) - ((img.width || 100) * scale / 2),
            top: (canvas.height! / 2) - ((img.height || 100) * scale / 2),
            cornerStyle: 'circle',
            cornerColor: '#e91e63',
            cornerStrokeColor: '#ffffff',
            borderColor: '#e91e63',
            transparentCorners: false,
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveToHistory();
        } catch (error) {
          console.error('Error loading image:', error);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Add text
  const addText = () => {
    if (!fabricRef.current) return;
    
    const text = new IText(textSettings.text, {
      left: fabricRef.current.width! / 2,
      top: fabricRef.current.height! / 2,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      fill: textSettings.fill,
      fontWeight: textSettings.fontWeight as any,
      fontStyle: textSettings.fontStyle as any,
      textAlign: textSettings.textAlign,
      underline: textSettings.underline,
      originX: 'center',
      originY: 'center',
      cornerStyle: 'circle',
      cornerColor: '#e91e63',
      cornerStrokeColor: '#ffffff',
      borderColor: '#e91e63',
      transparentCorners: false,
    });
    
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
    saveToHistory();
  };
  
  // Add shape
  const addShape = (type: 'rect' | 'circle') => {
    if (!fabricRef.current) return;
    
    let shape;
    const centerX = fabricRef.current.width! / 2;
    const centerY = fabricRef.current.height! / 2;
    
    if (type === 'rect') {
      shape = new Rect({
        left: centerX - 75,
        top: centerY - 75,
        width: 150,
        height: 150,
        fill: '#e91e63',
        cornerStyle: 'circle',
        cornerColor: '#e91e63',
        borderColor: '#e91e63',
        transparentCorners: false,
      });
    } else {
      shape = new Circle({
        left: centerX - 75,
        top: centerY - 75,
        radius: 75,
        fill: '#e91e63',
        cornerStyle: 'circle',
        cornerColor: '#e91e63',
        borderColor: '#e91e63',
        transparentCorners: false,
      });
    }
    
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
    fabricRef.current.renderAll();
    saveToHistory();
  };
  
  // Delete selected object
  const deleteSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    
    // Don't delete system objects
    if (selectedObject.name === 'safeArea' || selectedObject.name === 'phoneLabel') return;
    
    fabricRef.current.remove(selectedObject);
    fabricRef.current.renderAll();
    setSelectedObject(null);
    saveToHistory();
  };
  
  // Rotate object
  const rotateObject = (angle: number) => {
    if (!fabricRef.current || !selectedObject) return;
    
    const currentAngle = selectedObject.angle || 0;
    selectedObject.rotate(currentAngle + angle);
    fabricRef.current.renderAll();
    saveToHistory();
  };
  
  // Flip object
  const flipObject = (direction: 'horizontal' | 'vertical') => {
    if (!fabricRef.current || !selectedObject) return;
    
    if (direction === 'horizontal') {
      selectedObject.set('flipX', !selectedObject.flipX);
    } else {
      selectedObject.set('flipY', !selectedObject.flipY);
    }
    fabricRef.current.renderAll();
    saveToHistory();
  };
  
  // Duplicate object
  const duplicateObject = () => {
    if (!fabricRef.current || !selectedObject) return;
    
    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: (selectedObject.left || 0) + 20,
        top: (selectedObject.top || 0) + 20,
      });
      fabricRef.current!.add(cloned);
      fabricRef.current!.setActiveObject(cloned);
      fabricRef.current!.renderAll();
      saveToHistory();
    });
  };
  
  // Bring to front / Send to back
  const changeLayer = (action: 'front' | 'back') => {
    if (!fabricRef.current || !selectedObject) return;
    
    if (action === 'front') {
      fabricRef.current.bringObjectToFront(selectedObject);
    } else {
      fabricRef.current.sendObjectToBack(selectedObject);
    }
    fabricRef.current.renderAll();
    saveToHistory();
  };
  
  // Export canvas to base64
  const exportCanvas = (): string => {
    if (!fabricRef.current) return '';
    
    // Temporarily remove system objects for export
    const objects = fabricRef.current.getObjects();
    const systemObjects = objects.filter(obj => 
      (obj as any).name === 'safeArea' || (obj as any).name === 'phoneLabel' || (obj as any).name === 'phoneFrame'
    );
    
    systemObjects.forEach(obj => fabricRef.current!.remove(obj));
    
    const dataUrl = fabricRef.current.toDataURL({
      format: 'jpeg',
      quality: 0.8,
      multiplier: 1, // Reduced to avoid large file size
    });
    
    // Re-add system objects
    systemObjects.forEach(obj => fabricRef.current!.add(obj));
    fabricRef.current.renderAll();
    
    return dataUrl;
  };
  
  // Get design data as JSON
  const getDesignData = () => {
    if (!fabricRef.current) return null;
    
    // Get canvas JSON without system objects
    const json = fabricRef.current.toJSON() as any;
    json.objects = json.objects.filter((obj: any) => 
      obj.name !== 'safeArea' && obj.name !== 'phoneLabel' && obj.name !== 'phoneFrame'
    );
    
    return {
      ...json,
      width: selectedTemplate?.canvas_width,
      height: selectedTemplate?.canvas_height,
    };
  };
  
  // Save design
  const handleSave = async () => {
    if (!fabricRef.current || !selectedTemplate) return;
    
    setSaving(true);
    try {
      const designData = getDesignData();
      const previewImage = exportCanvas();
      
      const payload = {
        userId: user?.id || undefined,
        guestEmail: !isAuthenticated ? guestInfo.email : undefined,
        guestName: !isAuthenticated ? guestInfo.name : undefined,
        guestPhone: !isAuthenticated ? guestInfo.phone : undefined,
        templateId: selectedTemplate.template_id.toString(),
        phoneModel: selectedTemplate.phone_model,
        designData,
        previewImageBase64: previewImage,
      };
      
      let result: any;
      if (designState.designId) {
        result = await updateDesign(designState.designId.toString(), {
          designData,
          previewImageBase64: previewImage,
        });
      } else {
        result = await createDesign(payload);
        if (result?.design?.design_id) {
          setDesignState(prev => ({
            ...prev,
            designId: result.design.design_id
          }));
        }
      }
      
      alert('Đã lưu thiết kế thành công!');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Có lỗi khi lưu thiết kế. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };
  
  // Submit design
  const handleSubmit = async () => {
    if (!fabricRef.current || !selectedTemplate) return;
    
    // Validate guest info if not logged in
    if (!isAuthenticated) {
      if (!guestInfo.email || !guestInfo.name || !guestInfo.phone) {
        alert('Vui lòng nhập đầy đủ thông tin liên hệ!');
        return;
      }
    }
    
    setSaving(true);
    try {
      // First save the design
      const designData = getDesignData();
      const previewImage = exportCanvas();
      
      let designId = designState.designId;
      
      if (!designId) {
        const createResult = await createDesign({
          userId: user?.id || undefined,
          guestEmail: !isAuthenticated ? guestInfo.email : undefined,
          guestName: !isAuthenticated ? guestInfo.name : undefined,
          guestPhone: !isAuthenticated ? guestInfo.phone : undefined,
          templateId: selectedTemplate.template_id.toString(),
          phoneModel: selectedTemplate.phone_model,
          designData,
          previewImageBase64: previewImage,
        });
        designId = createResult.design?.design_id;
      } else {
        await updateDesign(designId.toString(), {
          designData,
          previewImageBase64: previewImage,
        });
      }
      
      if (!designId) {
        throw new Error('Không thể tạo thiết kế');
      }
      
      // Submit for review
      await submitDesign(designId.toString(), {
        guestEmail: !isAuthenticated ? guestInfo.email : undefined,
        guestName: !isAuthenticated ? guestInfo.name : undefined,
        guestPhone: !isAuthenticated ? guestInfo.phone : undefined,
      });
      
      setDesignState(prev => ({
        ...prev,
        designId,
        status: 'submitted'
      }));
      
      alert('Thiết kế đã được gửi! Admin sẽ xem xét và liên hệ với bạn.');
      
    } catch (error) {
      console.error('Error submitting design:', error);
      alert('Có lỗi khi gửi thiết kế. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };
  
  // Download design
  const handleDownload = () => {
    if (!fabricRef.current) return;
    
    const dataUrl = exportCanvas();
    const link = document.createElement('a');
    link.download = `design-${selectedTemplate?.phone_model || 'custom'}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };
  
  // Select template
  const handleSelectTemplate = (template: PhoneTemplate) => {
    setSelectedTemplate(template);
    setDesignState(prev => ({
      ...prev,
      phoneModel: template.phone_model,
      templateId: template.template_id
    }));
    setShowTemplateSelector(false);
  };
  
  // Template selector view
  if (showTemplateSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Thiết Kế Ốp Điện Thoại
            </h1>
            <div className="w-24"></div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chọn Model Điện Thoại
            </h2>
            <p className="text-gray-600 text-lg">
              Bước đầu tiên: Chọn mẫu điện thoại để bắt đầu thiết kế ốp lưng độc đáo của bạn
            </p>
          </div>
          
          {/* Loading state */}
          {loadingTemplates && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách điện thoại...</p>
            </div>
          )}
          
          {/* Empty state */}
          {!loadingTemplates && templates.length === 0 && (
            <div className="text-center py-20">
              <Smartphone className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có mẫu điện thoại nào</h3>
              <p className="text-gray-500 mb-6">Vui lòng liên hệ admin để thêm mẫu điện thoại vào hệ thống.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Thử lại
              </button>
            </div>
          )}
          
          {/* Group by brand */}
          {!loadingTemplates && templates.length > 0 && ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google', 'Huawei', 'Other'].map(brand => {
            const brandTemplates = templates.filter(t => t.brand === brand || (brand === 'Other' && !['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google', 'Huawei'].includes(t.brand)));
            if (brandTemplates.length === 0) return null;
            
            return (
              <div key={brand} className="mb-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-pink-600" />
                  {brand}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {brandTemplates.map(template => (
                    <button
                      key={template.template_id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-500 transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
                        {template.template_image_url ? (
                          <img 
                            src={template.template_image_url} 
                            alt={template.phone_model}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${template.template_image_url ? 'hidden' : ''}`}>
                          <Smartphone className="w-20 h-20 text-gray-300 group-hover:text-pink-400 transition-colors" />
                        </div>
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Select badge */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-pink-600 px-4 py-1.5 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                          Chọn mẫu này
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h4 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors text-base">
                          {template.phone_model}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {template.print_width_mm} × {template.print_height_mm} mm
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Design editor view
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Bạn có muốn chọn lại mẫu điện thoại? Thiết kế hiện tại sẽ bị mất nếu chưa lưu.')) {
                  fabricRef.current?.dispose();
                  fabricRef.current = null;
                  setShowTemplateSelector(true);
                  setSelectedTemplate(null);
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Đổi mẫu</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-pink-600" />
              <span className="font-semibold text-gray-900">{selectedTemplate?.phone_model}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hoàn tác"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Làm lại"
            >
              <Redo className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            {/* Zoom controls */}
            <button
              onClick={() => updateZoom(zoom - 0.1)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium w-14 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => updateZoom(zoom + 0.1)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Phóng to"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            {/* Action buttons */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              title="Tải xuống"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải xuống</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? 'Đang lưu...' : 'Lưu'}</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? 'Đang gửi...' : 'Gửi thiết kế'}</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <aside className="w-72 bg-white shadow-lg overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'upload', icon: ImageIcon, label: 'Ảnh' },
              { id: 'text', icon: Type, label: 'Chữ' },
              { id: 'shapes', icon: Palette, label: 'Hình' },
              { id: 'layers', icon: Layers, label: 'Lớp' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-4">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-pink-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-pink-500" />
                  <span className="font-medium text-gray-700">Tải ảnh lên</span>
                  <span className="text-xs text-gray-500">PNG, JPG tối đa 10MB</span>
                </button>
                
                <p className="text-sm text-gray-500">
                  💡 <strong>Mẹo:</strong> Sử dụng ảnh có độ phân giải cao để kết quả in đẹp nhất!
                </p>
              </div>
            )}
            
            {/* Text Tab */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                  <textarea
                    value={textSettings.text}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    rows={2}
                    placeholder="Nhập nội dung..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font chữ</label>
                  <select
                    value={textSettings.fontFamily}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cỡ chữ</label>
                    <input
                      type="number"
                      value={textSettings.fontSize}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 40 }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={10}
                      max={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Màu chữ</label>
                    <input
                      type="color"
                      value={textSettings.fill}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, fill: e.target.value }))}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* Text style buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextSettings(prev => ({ 
                      ...prev, 
                      fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' 
                    }))}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      textSettings.fontWeight === 'bold' ? 'bg-pink-100 border-pink-500 text-pink-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Bold className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextSettings(prev => ({ 
                      ...prev, 
                      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' 
                    }))}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      textSettings.fontStyle === 'italic' ? 'bg-pink-100 border-pink-500 text-pink-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Italic className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, underline: !prev.underline }))}
                    className={`flex-1 py-2 rounded-lg border transition ${
                      textSettings.underline ? 'bg-pink-100 border-pink-500 text-pink-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Underline className="w-4 h-4 mx-auto" />
                  </button>
                </div>
                
                <button
                  onClick={addText}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition"
                >
                  + Thêm chữ
                </button>
              </div>
            )}
            
            {/* Shapes Tab */}
            {activeTab === 'shapes' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Thêm hình dạng vào thiết kế</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addShape('rect')}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition flex items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-pink-500 rounded-lg"></div>
                  </button>
                  <button
                    onClick={() => addShape('circle')}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition flex items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-pink-500 rounded-full"></div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Layers Tab */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Quản lý các lớp trong thiết kế</p>
                {fabricRef.current?.getObjects().filter(obj => 
                  (obj as any).name !== 'safeArea' && (obj as any).name !== 'phoneLabel'
                ).map((obj, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedObject === obj ? 'border-pink-500 bg-pink-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      fabricRef.current?.setActiveObject(obj);
                      fabricRef.current?.renderAll();
                      setSelectedObject(obj);
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      {obj.type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                      ) : obj.type === 'i-text' || obj.type === 'text' ? (
                        <Type className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Palette className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {obj.type === 'i-text' || obj.type === 'text' 
                          ? (obj as any).text?.substring(0, 20) || 'Text'
                          : obj.type === 'image' 
                            ? 'Hình ảnh'
                            : obj.type === 'rect'
                              ? 'Hình chữ nhật'
                              : 'Hình tròn'
                        }
                      </p>
                      <p className="text-xs text-gray-500">{obj.type}</p>
                    </div>
                  </div>
                ))}
                
                {fabricRef.current?.getObjects().filter(obj => 
                  (obj as any).name !== 'safeArea' && (obj as any).name !== 'phoneLabel'
                ).length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    Chưa có layer nào. Hãy thêm ảnh hoặc chữ!
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Guest Info Form (if not logged in) */}
          {!isAuthenticated && (
            <div className="p-4 border-t bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </aside>
        
        {/* Canvas Area */}
        <main 
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-8"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4">
            <canvas ref={canvasRef} />
          </div>
        </main>
        
        {/* Right Sidebar - Object Properties */}
        {selectedObject && (
          <aside className="w-64 bg-white shadow-lg overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Chỉnh sửa đối tượng</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Transform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xoay</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => rotateObject(-15)}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    <RotateCcw className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => rotateObject(15)}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    <RotateCw className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
              
              {/* Flip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lật</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => flipObject('horizontal')}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    <FlipHorizontal className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => flipObject('vertical')}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    <FlipVertical className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
              
              {/* Layer order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thứ tự lớp</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLayer('front')}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition text-xs"
                  >
                    Đưa lên trên
                  </button>
                  <button
                    onClick={() => changeLayer('back')}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition text-xs"
                  >
                    Đưa xuống dưới
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={duplicateObject}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-100 transition"
                  title="Nhân đôi"
                >
                  <Copy className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={deleteSelected}
                  className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
              
              {/* Color picker for shapes */}
              {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
                  <input
                    type="color"
                    value={selectedObject.fill || '#e91e63'}
                    onChange={(e) => {
                      selectedObject.set('fill', e.target.value);
                      fabricRef.current?.renderAll();
                      saveToHistory();
                    }}
                    className="w-full h-10 border rounded-lg cursor-pointer"
                  />
                </div>
              )}
              
              {/* Text editing */}
              {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Màu chữ</label>
                    <input
                      type="color"
                      value={selectedObject.fill || '#000000'}
                      onChange={(e) => {
                        selectedObject.set('fill', e.target.value);
                        fabricRef.current?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cỡ chữ</label>
                    <input
                      type="number"
                      value={selectedObject.fontSize || 40}
                      onChange={(e) => {
                        selectedObject.set('fontSize', parseInt(e.target.value) || 40);
                        fabricRef.current?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={10}
                      max={200}
                    />
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
