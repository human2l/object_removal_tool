
import cv2
import sys
import numpy as np

def mouse_callback__(event, x, y, flags, param):
    self_ = param
    self_.mouse_callback(event, x, y, flags)

class Annotation:
    IMG_SIZE=800
    def __init__(self, img_fname, mask_fname):
        self.img_fname = img_fname
        self.mask_fname = mask_fname
        #load image to self.img
        self.img = cv2.imread(img_fname)
        #resize self.img
        self.img  = cv2.resize(self.img , (self.IMG_SIZE, self.IMG_SIZE), interpolation=cv2.INTER_AREA) 
        #load image to self.mask
        self.mask = cv2.imread(mask_fname, cv2.IMREAD_COLOR)
        self.width= self.mask.shape[0]
        self.height= self.mask.shape[1]
        #resize self.mask
        self.mask = cv2.resize(self.mask , (self.IMG_SIZE, self.IMG_SIZE), interpolation=cv2.INTER_AREA)

        _, self.mask = cv2.threshold(self.mask, 100, 255, cv2.THRESH_BINARY)
        self.pointer = (-500, -500)
        self.pointer_size = 10
        self.annotation_color = (0,0,0)
        self.annotating = False
        self.alpha = 0.9
        self.window_title = 'img'

    def mouse_callback(self, event, x, y, flags):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.annotating = True
        elif event == cv2.EVENT_LBUTTONUP:
            self.annotating = False

        if self.annotating:
            cv2.circle(self.mask, self.pointer, self.pointer_size, self.annotation_color, -1)

        self.pointer = (x,y)
        self.redraw()

    def save(self):
        mask = cv2.cvtColor(self.mask, cv2.COLOR_BGR2GRAY)
        mask = cv2.resize(mask , (self.height, self.width), interpolation=cv2.INTER_AREA) 
        cv2.imwrite(self.mask_fname, mask)
        cv2.destroyWindow(self.window_title) 

    def handle_keyboard(self):
        while True:
            k = cv2.waitKey(0)
            if k == 27:
                sys.exit(0)
            elif k == ord(' '):
                return
            elif k == ord(']'):
                self.pointer_size = min(self.pointer_size + 1, 50)
            elif k == ord('['):
                self.pointer_size = max(self.pointer_size - 1, 3)
            elif k == ord('9'):
                self.alpha = max(self.alpha - 0.01, 0)
            elif k == ord('0'):
                self.alpha = min(self.alpha + 0.01, 1)
            elif k == 9: #TAB
                c = (0,0,0) if self.annotation_color[0] != 0 else (255,255,255)
                self.annotation_color = c
                #self.annotation_color = tuple(255 - np.array(self.annotation_color))
            elif k == 13: #ENTER
                self.save()
                return
            else:
                print("################################## ", k)
            self.redraw()

    def redraw(self):
        if self.img is not None and self.mask is not None:
            #addWeighted calculates the weighted sum of two arrays
            tmp = cv2.addWeighted(self.img, self.alpha, self.mask, 1 - self.alpha, 0)
            #The function cv::circle draws a simple or filled circle with a given center and radius
            cv2.circle(tmp, self.pointer, self.pointer_size, self.annotation_color, 2)
            
            cv2.imshow(self.window_title, tmp)

    def run(self):
        #create a window as a placeholder for image
        cv2.namedWindow(self.window_title)
        #set mouse handler for the window
        cv2.setMouseCallback(self.window_title, mouse_callback__, self)

        self.redraw()
        self.handle_keyboard()
        

def main():
    for i in range(1, len(sys.argv), 2):
        Annotation(sys.argv[i], sys.argv[i+1]).run()

if __name__ == "__main__":
    main()
